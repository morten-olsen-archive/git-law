import fs from 'fs/promises';
import path from 'path';
import { Reporter } from '../types/Config';

interface Options {
  outputPath: string;
}

const fileReporter = (options: Options): Reporter => async (report) => {
  const target = path.resolve(options.outputPath);
  const result = JSON.stringify(report, null, '  ');
  await fs.writeFile(target, result, 'utf-8');
}

export default fileReporter;
