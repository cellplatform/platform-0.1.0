import { t, minimist } from '../common';

type P = minimist.ParsedArgs;

export const nameArg = (argv: P, defaultValue?: string): string | undefined => {
  let value = argv._[1] || argv.name;
  value = Array.isArray(value) ? value[value.length - 1] : value;
  return value === undefined ? defaultValue : value;
};

export function modeArg(argv: P, defaultValue?: t.WpMode): t.WpMode {
  const mode = argv.mode;
  if (mode === 'production' || mode === 'prod') {
    return 'production';
  }
  if (mode === 'development' || mode === 'dev') {
    return 'development';
  }
  if (argv.prod === true) {
    return 'production';
  }
  if (argv.dev === true) {
    return 'development';
  }
  return defaultValue || 'production';
}

export function bumpArg(
  argv: P,
  defaultValue?: t.VersionBumpLevel,
): t.VersionBumpLevel | undefined {
  const value = argv.bump;
  if (value === true) return 'patch';
  if (typeof value === 'string') return value as t.VersionBumpLevel;
  return defaultValue;
}
