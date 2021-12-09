import Rule from "./Rule";
import { RunReport } from "./RunReport";

enum PolicyType {
  Enforced = 'enforced',
  Required = 'required',
  Recommended = 'recommended',
}

type Reporter = (report: RunReport) => Promise<void>;

interface Config {
  auth: {
    token: string;
  };
  reporters: Reporter[];
  onlyConfiguredRepos?: boolean;
  policyFile?: string;
  repos?: {
    include?: string[];
    exclude?: string[];
  };
  rules: {
    [name: string]: Rule;
  };
  policy: {
    default: {
      [name: string]: PolicyType;
    };
    overrides?: {
      [repo: string]: {
        [ruleName: string]: PolicyType;
      };
    };
  };
}

export { PolicyType, Reporter }
export default Config;
