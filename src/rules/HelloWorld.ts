import Rule, { RuleArgs, RuleValidationReport } from '../types/Rule';

class ReviewRequired implements Rule {
  public validate = async ({}: RuleArgs) => {
    const report: RuleValidationReport = {
      invalidReasons: [
        `This is just a demo`,
      ],
    }; 

    return report;
  }
}

export default ReviewRequired;
