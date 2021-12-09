import Rule, { RuleArgs, RuleValidationReport } from '../types/Rule';

interface Options {
  requiredReviewers?: number;
}

interface RepoConfig {
  requiredReviewers?: number;
}

class ReviewRequired implements Rule<RepoConfig> {
  #options:  Options;

  constructor(options: Options) {
    this.#options = options;
  }

  public validate = async ({
    repo,
    octo,
    repoConfig,
  }: RuleArgs) => {
    const report: RuleValidationReport = {
      invalidReasons: [],
    }; 
    const { data: branch } = await octo.rest.repos.getBranch({
      repo: repo.name,
      owner: repo.owner.login,
      branch: repo.default_branch,
    });

    if (!branch.protected) {
      report.invalidReasons.push(`No branch protection for default branch ${repo.default_branch}`)
      return report;
    }

    const { data: protections } = await octo.rest.repos.getBranchProtection({
      repo: repo.name,
      owner: repo.owner.login,
      branch: repo.default_branch,
    });

    if (!protections.required_pull_request_reviews) {
      report.invalidReasons.push('Review not required')
    } else {
      const expectedReviewers = Math.max(
        (repoConfig.requiredReviewers || 0),
        (this.#options.requiredReviewers || 0),
      );
      const currentRequiredReviewers = protections.required_pull_request_reviews.required_approving_review_count || 0;
      if (currentRequiredReviewers < expectedReviewers) {
        report.invalidReasons.push(
          `Only ${protections.required_pull_request_reviews.required_approving_review_count || 0} review(s) required, ${this.#options.requiredReviewers} expected`,
        );
      }
    }

    return report;
  }
}

export default ReviewRequired;
