import { Octokit } from 'octokit';
import yaml from 'yaml';
import Config, { PolicyType } from './types/Config';
import { Repo } from './types/Github';
import { RepoRunReport, RunReport } from './types/RunReport';
import { DEFAULT_POLICY_LOCATION } from './constants';
import Utils from './utils';
import { RuleArgs } from './types/Rule';

const shouldRun = (includes: string[] = ['*/*'], excludes: string[] = [], repo: Repo) => {
  const isIncluded = includes.reduce((result, current) => {
    if (result) return result;
    const [userName = '*', repoName = '*'] = current.split('/');
    return (userName === '*' || userName === repo.owner.login) && (repoName === '*' || repoName === repo.name);
  }, false)

  const isExcluded = excludes.reduce((result, current) => {
    if (result) return result;
    const [userName = '', repoName = ''] = current.split('/');
    return (userName === '*' || userName === repo.owner.login) && (repoName === '*' || repoName === repo.name);
  }, false)

  return isIncluded && !isExcluded;
}


class Runner {
  #config: Config;
  #octo: Octokit;

  constructor(config: Config) {
    this.#config = config;
    this.#octo = new Octokit({
      auth: config.auth.token,
    });
  }

  #runRepo = async (repo: Repo, repoConfig: any) => {
    let applicableRules: {[name: string]: PolicyType} = {...this.#config.policy.default};
    Object.entries(this.#config.policy.overrides || {}).forEach(([repoName, policy]) => {
      if (!shouldRun([repoName], [], repo)) return;
      applicableRules = {
        ...applicableRules,
        ...policy,
      };
    })
    const rules = this.#config.rules;
    const report: RepoRunReport = {
      repo: repo.name,
      owner: repo.owner.login,
      rules: {},
    };

    for (let [ruleName, ruleType] of Object.entries(applicableRules)) {
      const rule = rules[ruleName];
      const utils = new Utils(this.#octo, repo, this.#config);
      const args: RuleArgs = {
        repo,
        utils,
        octo: this.#octo,
        repoConfig: repoConfig,
      };
      const validationResult = await rule.validate(args); 
      report.rules[ruleName] = {
        type: ruleType,
        preEnforcement: validationResult,
        postEnforcement: validationResult,
      };
      if (ruleType === PolicyType.Enforced && validationResult.invalidReasons.length > 0) {
        if (!rule.enforce) {
          throw new Error(`Trying to enforce un-enforcable rule ${ruleName}`);
        }
        const enforcementResult = await rule.enforce(args);
        report.rules[ruleName].enforcement = enforcementResult;
        const postEnforcementResult = await rule.validate(args); 
        report.rules[ruleName] .postEnforcement = postEnforcementResult;
      }
    }
    return report;
  }

  public run = async () => {
    const report: RunReport = {
      time: new Date().toString(),
      repos: [],
    }
    const github = this.#octo.rest;
    const action = github.repos.listForAuthenticatedUser;
    const errors: any[] = [];
    const iterator = await this.#octo.paginate(
      action,
      { visibility: 'all' },
    );
    for await (const repo of iterator) {
      try {
        if (!shouldRun(this.#config.repos?.include, this.#config.repos?.exclude, repo as Repo)) {
          continue;
        }
        const repoPolicy: any = {};
        try {
          const policyFile = await github.repos.getContent({
            owner: repo.owner.login,
            repo: repo.name,
            path: this.#config.policyFile || DEFAULT_POLICY_LOCATION,
          });
          const content = Buffer.from(
            (policyFile.data as any).content,
            (policyFile.data as any).encoding,
          ).toString('utf-8');
          repoPolicy.policy = yaml.parse(content);
          repoPolicy.found = true;
        } catch (err: any) {
          if (err.status === 404) {
            repoPolicy.found = false;
            if (this.#config.onlyConfiguredRepos) {
              continue;
            }
          } else {
            throw err;
          }
        }
        const repoResult = await this.#runRepo(repo as any as Repo, repoPolicy);
        report.repos.push(repoResult);
      } catch (err) {
        errors.push(err);
      }
    }
    if (errors.length > 0) {
      errors.map(console.error);
      throw new Error('Run failed')
    }
    await Promise.all(this.#config.reporters.map(reporter => reporter(report)));
  }
}

export default Runner;
