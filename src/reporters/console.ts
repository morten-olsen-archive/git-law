import { Reporter } from '../types/Config';

const consoleReporter: Reporter = async (report) => {
  console.log(JSON.stringify(report, null, '  '));
}

export default consoleReporter;
