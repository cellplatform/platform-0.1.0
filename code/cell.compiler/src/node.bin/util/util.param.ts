import { minimist } from '../common';

type P = minimist.ParsedArgs;

export const nameArg = (argv: P): string | undefined => {
  const value = argv.name;
  return Array.isArray(value) ? value[value.length - 1] : value;
};