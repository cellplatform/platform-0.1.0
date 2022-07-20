import { parse } from 'url';
import { fs } from './libs';
import * as t from './types';
import { DEFAULT } from './constants';
import { defaultValue } from '@platform/util.value/lib/value/value';

type M = t.CompilerModel | t.CompilerModelBuilder;

export function isModel(input: M) {
  return typeof (input as any).toObject === 'function';
}

/**
 * Wrangle object types into a [model].
 */
export const toModel = (input: M) => {
  return (isModel(input) ? (input as any).toObject() : input) as t.CompilerModel;
};

/**
 * Helpers for reading a model (with default values)
 */
export function Model(input: M) {
  const model = toModel(input);

  const res = {
    toObject: () => model,

    get isProd() {
      return res.mode() === 'production';
    },

    get isDev() {
      return res.mode() === 'development';
    },

    get isNode() {
      return res.target() === 'node';
    },

    get entryFile() {
      const target = res.target();
      const ENTRY = DEFAULT.FILE.ENTRY;
      return target === 'node' ? ENTRY.NODE : ENTRY.HTML;
    },

    get env() {
      return model.env ?? {};
    },

    get paths() {
      return ModelPaths(model);
    },

    name(defaultValue?: string) {
      return model.name ?? defaultValue ?? DEFAULT.CONFIG.name;
    },

    namespace(defaultValue?: string) {
      return model.namespace ?? defaultValue ?? '';
    },

    version(defaultValue?: string) {
      return model.version ?? defaultValue ?? '0.0.0';
    },

    mode(defaultValue?: t.WpMode) {
      return model.mode ?? defaultValue ?? DEFAULT.CONFIG.mode;
    },

    target(defaultTarget?: string) {
      return model.target ?? defaultTarget ?? DEFAULT.CONFIG.target;
    },

    port(defaultPort?: number) {
      return defaultValue(model.port, defaultValue(defaultPort, DEFAULT.CONFIG.port));
    },

    static() {
      const value = model.static ?? [];
      return Array.isArray(value) ? value : [value];
    },

    entry(defaultValue?: t.CompilerModel['entry']) {
      return model.entry ?? defaultValue ?? DEFAULT.CONFIG.entry;
    },

    rules(defaultValue?: t.CompilerModelWebpack['rules']) {
      return model.webpack?.rules ?? defaultValue ?? DEFAULT.WEBPACK.rules;
    },

    plugins(defaultValue?: t.CompilerModelWebpack['plugins']) {
      return model.webpack?.plugins ?? defaultValue ?? DEFAULT.WEBPACK.plugins;
    },
  };

  return res;
}

/**
 * Derives model paths from a model.
 */
export function ModelPaths(model: t.CompilerModel): t.CompilerModelPaths {
  const base = model.outdir ?? DEFAULT.CONFIG.outdir;
  const dist = fs.join(base, model.target || '');
  const bundle = `${dist}.bundle`;
  return {
    out: { base, dist, bundle },
  };
}
