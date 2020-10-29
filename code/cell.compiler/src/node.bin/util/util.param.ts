import { minimist } from '../common';

type P = minimist.ParsedArgs;

export const nameArg = (argv: P, defaultValue?: string): string | undefined => {
  let value = argv._[1] || argv.name;
  value = Array.isArray(value) ? value[value.length - 1] : value;
  return value === undefined ? defaultValue : value;
};
