import { log, Model, t, encoding } from '../common';
import { stats } from '../Config.webpack';
import { format } from './util.format';

/**
 * Value formatters
 */

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

  stats(input?: t.WpStats | t.WpCompilation) {
    stats(input).log();
    return logger;
  },

  model(input: t.CompilerModel, options: { indent?: number; url?: string | boolean } = {}) {
    const { indent } = options;
    const { cyan, gray } = log;
    const prefix = typeof indent === 'number' ? ' '.repeat(indent) : '';
    const model = Model(input);
    const obj = model.toObject();
    const port = model.port();

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
    add('namespace', green(obj.namespace));
    add('mode', green(model.mode()));
    add('target', green(model.target()));

    if (options.url) {
      let url = typeof options.url === 'string' ? options.url : 'http://localhost';
      url = port === 80 ? url : `${url}:${port}`;
      add('url', cyan(url));
    }

    table.log();
    return logger;
  },

  exports(model: t.CompilerModel, options: { title?: string } = {}) {
    if (model.exposes) {
      const { title = 'Exports' } = options;
      const exposes = encoding.transformKeys(model.exposes, encoding.unescapePath);
      log.info.gray(title);
      Object.keys(exposes).forEach((path) => {
        log.info(`  ${format.filepath(path)}`);
      });
    }
    return logger;
  },

  variants(model: t.CompilerModel, options: { title?: string } = {}) {
    const variants = model.variants || [];
    if (variants.length > 0) {
      const { title = 'Build variants' } = options;
      log.info();
      log.info.gray(title);
      model.variants?.forEach((name) => {
        log.info.gray(` • ${log.white(name)}`);
      });
    }
    return logger;
  },

  errors(list: { message: string }[]) {
    list.forEach((err, i) => {
      log.info.gray(`${log.red('ERROR')} ${log.yellow(i + 1)} of ${list.length}`);
      log.info(err.message);
      log.info();
    });
    return logger;
  },
};
