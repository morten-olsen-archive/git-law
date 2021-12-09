import { Octokit } from 'octokit';
import Utils from '../utils';
import { Repo } from './Github';
import { RuleValidationReport, RuleEnforcementReport } from './RunReport';

interface RuleArgs<T = any> {
  repoConfig: T;
  repo: Repo;
  octo: Octokit;
  utils: Utils;
}

interface Rule<Config = any> {
  validate: (config: RuleArgs<Config>) => Promise<RuleValidationReport>;
  enforce?: (config: RuleArgs<Config>) => Promise<RuleEnforcementReport>;
}

export type { RuleArgs, RuleValidationReport, RuleEnforcementReport };
export default Rule;
