import { Octokit } from 'octokit';
import { Repo } from '../types/Github';
import Config from '../types/Config';
import wildcardMatch from 'wildcard-match';
import { DEFAULT_POLICY_LOCATION } from '../constants';

interface CodeOwnerFile {
  [path: string]: string[];
}

class Utils {
  #octo: Octokit;
  #repo: Repo;
  #config: Config;

  constructor(octo: Octokit, repo: Repo, config: Config) {
    this.#octo = octo;
    this.#repo = repo;
    this.#config = config;
  }

  public get repoPolicyPath() {
    return this.#config.policyFile || DEFAULT_POLICY_LOCATION;
  }

  public getFile = async (path: string) => {
    try {
      const file = await this.#octo.rest.repos.getContent({
        repo: this.#repo.name,
        owner: this.#repo.owner.login,
        path,
      });
      const content = Buffer.from((file.data as any).content, (file.data as any).encoding).toString('utf-8');
      return content;
    } catch (err) {
      if ((err as any).status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  public getCodeOwners = async () => {
    let codeOwnerFile = await this.getFile('.github/CODEOWNERS');
    if (!codeOwnerFile) {
      codeOwnerFile = await this.getFile('CODEOWNERS');
    }
    if (!codeOwnerFile) {
      return {};
    }
    const lines = codeOwnerFile
      .split('\n')
      .filter(l => !l.startsWith('#'))
      .filter(l => l !== '');

    const owners = lines.reduce<CodeOwnerFile>((output, line) => {
      const [file, ...owners] = line.split(' ');
      return {
        ...output,
        [file]: owners
      };
    }, {});

    return owners;
  }

  public isOwner = (username: string, path: string, owners: CodeOwnerFile) => {
    for (let currentPath of Object.keys(owners).reverse()) {
      const isMatch = wildcardMatch(currentPath);
      if (isMatch(path)) {
        return owners[currentPath].includes(username);
      }
    }
    return false;
  }
}

export type { CodeOwnerFile };
export default Utils;
