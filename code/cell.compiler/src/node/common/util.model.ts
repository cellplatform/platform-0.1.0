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
      const ENTRY = DEFAULT.FILE.JS.ENTRY;
      return target === 'node' ? ENTRY.NODE : ENTRY.WEB;
    },

    get bundleDir() {
      return `${res.dir()}/${res.target()}`;
    },

    get env() {
      return model.env || {};
    },

    name(defaultValue?: string) {
      return model.name || defaultValue || DEFAULT.CONFIG.name;
    },

    mode(defaultValue?: t.WpMode) {
      return model.mode || defaultValue || DEFAULT.CONFIG.mode;
    },

    target(defaultTarget?: string) {
      return model.target || defaultTarget || DEFAULT.CONFIG.target;
    },

    port(defaultPort?: number) {
      return defaultValue(model.port, defaultValue(defaultPort, DEFAULT.CONFIG.port));
    },

    dir(defaultValue?: string) {
      const dir = model.dir || defaultValue || DEFAULT.CONFIG.dir;
      return fs.resolve(dir);
    },

    static() {
      const value = model.static || [];
      return Array.isArray(value) ? value : [value];
    },

    entry(defaultValue?: t.CompilerModel['entry']) {
      return model.entry || defaultValue || DEFAULT.CONFIG.entry;
    },

    rules(defaultValue?: t.CompilerModelWebpack['rules']) {
      return model.webpack?.rules || defaultValue || DEFAULT.WEBPACK.rules;
    },

    plugins(defaultValue?: t.CompilerModelWebpack['plugins']) {
      return model.webpack?.plugins || defaultValue || DEFAULT.WEBPACK.plugins;
    },
  };

  return res;
}
