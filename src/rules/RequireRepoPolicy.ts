import Rule, { RuleArgs, RuleValidationReport } from '../types/Rule';
import yaml from 'yaml';

class ReviewRequired implements Rule {
  public validate = async ({
    utils,
  }: RuleArgs) => {
    const report: RuleValidationReport = {
      invalidReasons: [],
    }; 

    const policy = await utils.getFile(utils.repoPolicyPath);
    if (!policy) {
      report.invalidReasons.push(`${utils.repoPolicyPath} does not exist`);
      return report;
    }

    try {
      yaml.parse(policy);
    } catch (err: any) {
      report.invalidReasons.push(`${utils.repoPolicyPath} is not valid yaml: ${err.toString()}`)
    }

    return report;
  }
}

export default ReviewRequired;
