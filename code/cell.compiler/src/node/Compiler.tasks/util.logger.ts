import { parse as parseUrl } from 'url';
import { Compilation as ICompliation, Stats as IStats } from 'webpack';

import { log, Model, t } from '../common';
import { stats } from '../Config.webpack';

/**
 * Value formatters
 */
export const format = {
  url(value: string) {
    value = (value || '').trim();
    const parsed = parseUrl(value);
    const domain = log.gray(`${parsed.protocol}//${parsed.host}`);
    const path = (parsed.pathname || '')
      .replace(/cell\:/g, log.cyan('cell:'))
      .replace(/\//g, log.gray('/'))
      .replace(/\:/g, log.gray(':'));
    const suffix = parsed.search ? log.gray(parsed.search) : '';
    const url = `${domain}${path}${suffix}`;
    return log.white(url);
  },
};

/**
 * Log helpers for webpack.
 */
export const logger = {
  format,

  clear() {
    log.clear();
    return logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return logger;
  },

  hr(length = 60) {
    log.info.gray('━'.repeat(length));
    return logger;
  },

  stats(input?: IStats | ICompliation) {
    stats(input).log();
    return logger;
  },

  model(input: t.CompilerModel, options: { indent?: number; url?: string | boolean } = {}) {
    const { indent } = options;
    const { cyan, gray } = log;
    const prefix = typeof indent === 'number' ? ' '.repeat(indent) : '';
    const model = Model(input);
    const obj = model.toObject();

    const green = (value?: any) => (value === undefined ? undefined : log.green(value));

    const table = log.table({ border: false });
    const add = (key: string, value: string | undefined) => {
      if (value) {
        const left = log.gray(`${prefix}${log.white(key)}: `);
        table.add([left, value]);
      }
    };

    let name = green(model.name());
    name = obj.title ? gray(`${name}/${obj.title}`) : name;

    add('name', name);
    add('scope', green(obj.scope));
    add('mode', green(model.mode()));
    add('target', green(model.target().join()));

    if (options.url) {
      const port = model.port();
      let url = typeof options.url === 'string' ? options.url : 'http://localhost';
      url = port === 80 ? url : `${url}:${port}`;
      add('url', cyan(url));
    }

    table.log();

    return logger;
  },
};
