import { log, ModuleFederationPlugin, t } from '../common';
import { COMMANDS } from './constants';
import { loadConfig } from './util.loadConfig';

type B = t.BuilderChain<t.CompilerConfigMethods>;

export const logger = {
  clear() {
    log.clear();
    return logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return logger;
  },

  commands() {
    const table = log.table({ border: false });
    Object.keys(COMMANDS).forEach((key) => {
      const cmd = COMMANDS[key];
      table.add([`${key}  `, log.green(cmd.description)]);
      Object.keys(cmd.params).forEach((key) => {
        const param = cmd.params[key];
        table.add([`  ${log.gray(key)}  `, `${log.gray(param)}`]);
      });
      table.add(['']);
    });

    log.info();
    table.log();
    log.info();

    return logger;
  },

  async info(input?: string | B) {
    const config = typeof input === 'object' ? input : await loadConfig(input);
    const webpack = config.toWebpack();
    const plugins = webpack.plugins || [];
    const mf = plugins.find((plugin) => plugin instanceof ModuleFederationPlugin);

    log.info.cyan('Configuration (Model)');
    log.info(config.toObject());

    log.info();
    log.info.cyan('Webpack');
    log.info({
      ...webpack,
      plugins: plugins.map((plugin) => plugin?.constructor?.name),
    });

    log.info();
    log.info.cyan('Webpack: Module Federation');
    log.info(mf?._options);

    log.info();
    return logger;
  },
};
