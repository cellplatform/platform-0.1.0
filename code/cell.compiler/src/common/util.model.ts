import { parse } from 'url';
import { fs } from './libs';
import * as t from './types';
import { DEFAULT } from './constants';

type M = t.CompilerWebpackModel | t.CompilerConfig;

export function isModel(input: M) {
  return typeof (input as any).toObject === 'function';
}

/**
 * Wrangle object types into a [model].
 */
export const toModel = (input: M) => {
  return (isModel(input) ? (input as any).toObject() : input) as t.CompilerWebpackModel;
};

/**
 * Helpers for reading a model (with default values)
 */
export function Model(input: M) {
  const DEFAULTS = DEFAULT.CONFIG;
  const model = toModel(input);

  const res = {
    toObject: () => model,

    get prod() {
      return res.mode() === 'production';
    },

    name(defaultValue?: string) {
      return model.name || defaultValue || DEFAULTS.name;
    },

    mode(defaultValue?: t.WpMode) {
      return model.mode || defaultValue || DEFAULTS.mode;
    },

    target(...defaultTargets: string[]) {
      defaultTargets = defaultTargets.length === 0 ? DEFAULTS.target : defaultTargets;
      return toTargetArray(model.target, ...defaultTargets);
    },

    url(defaultValue?: string): string {
      return (model.url || defaultValue || DEFAULTS.url) as string;
    },

    port(defaultUrl?: string) {
      const url = parse(res.url(defaultUrl));
      return url.port ? parseInt(url.port, 10) : DEFAULT.PORT;
    },

    dir(defaultValue?: string) {
      const dir = model.dir || defaultValue || DEFAULTS.dir;
      return dir ? fs.resolve(dir) : undefined;
    },

    entry(defaultValue?: t.CompilerWebpackModel['entry']) {
      return model.entry || defaultValue || DEFAULTS.entry;
    },

    rules(defaultValue?: t.CompilerWebpackModel['rules']) {
      return model.rules || defaultValue || DEFAULTS.rules;
    },
  };

  return res;
}

/**
 * Derive targets as an array
 */
export function toTargetArray(
  value: t.CompilerWebpackModel['target'],
  ...defaultTargets: string[]
): string[] {
  if (!value) {
    return defaultTargets;
  } else {
    return Array.isArray(value) ? value : [value];
  }
}
