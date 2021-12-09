import { PolicyType } from "./Config";

interface RuleValidationReport {
  invalidReasons: string[];
}

interface RuleEnforcementReport {
  success: boolean;
  enforces: string[];
  errors: string[];
}

interface RuleRunReport {
  type: PolicyType;
  preEnforcement: RuleValidationReport;
  enforcement?: RuleEnforcementReport;
  postEnforcement?: RuleValidationReport;
}

interface RepoRunReport {
  repo: string;
  owner: string;
  rules: {
    [name: string]: RuleRunReport;
  };
}

interface RunReport {
  time: string;
  repos: RepoRunReport[];
}

export type {
  RuleValidationReport,
  RuleEnforcementReport,
  RepoRunReport,
  RunReport,
};
