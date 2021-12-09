import { Command } from 'commander';
import path from 'path';
import Runner, { Config } from './';

const program = new Command();
program.option('-c, --config <location>', 'location of configuration file', './gitlaw');

const run = program.command('run');

const getConfig = () => {
  const configLocation = path.resolve(program.getOptionValue('config'));
  const mod = require(configLocation);
  const config: Config = mod.default || mod;
  return config;
}

run.action(async () => {
  const config = getConfig();
  const runner = new Runner(config);
  await runner.run();
})

program.parse(process.argv);
