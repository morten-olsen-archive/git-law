import Rule, { RuleArgs, RuleValidationReport } from '../types/Rule';

interface Options {
  owner: string;
}

class ReviewRequired implements Rule {
  #options:  Options;

  constructor(options: Options) {
    this.#options = options;
  }

  public validate = async ({
    utils,
  }: RuleArgs) => {
    const report: RuleValidationReport = {
      invalidReasons: [],
    }; 

    const owners = await utils.getCodeOwners();
    if (!utils.isOwner(this.#options.owner, utils.repoPolicyPath, owners)) {
      report.invalidReasons.push(`User ${this.#options.owner} is not owner of ${utils.repoPolicyPath}`);
    }

    return report;
  }
}

export default ReviewRequired;
