import fs from 'fs/promises';
import path from 'path';
import { RepoRunReport, RuleRunReport, RunReport } from '..';
import { Reporter } from '../types/Config';

interface Options {
  outputPath: string;
}

const ruleResult = (name: string, rule: RuleRunReport) => `| ${name} | ${rule.postEnforcement.invalidReasons.length === 0 ? '✔️' : '❌'} |{${rule.type} | ${rule.postEnforcement.invalidReasons.join(', ')} |`

const repoResult = (repo: RepoRunReport) => !Object.values(repo.rules).find(r => r.postEnforcement.invalidReasons.length > 0);
const repoBox = (repo: RepoRunReport) => `
<details>
  <summary>${repoResult(repo) ? '✔️' : '❌'} ${repo.owner}/${repo.repo}</summary>

| Rule | Status | Type | Reasons |
| ---- | ------ | ---- | ------- |
${Object.entries(repo.rules).map(([name, result]) => ruleResult(name, result)).join('\n')}

</details>
`;

const markdown = (report: RunReport) => `
  ${report.repos.map(repoBox).join('\n\n')}
`

const markdownReporter = (options: Options): Reporter => async (report) => {
  const target = path.resolve(options.outputPath);
  const result = markdown(report);
  await fs.writeFile(target, result, 'utf-8');
}

export default markdownReporter;
