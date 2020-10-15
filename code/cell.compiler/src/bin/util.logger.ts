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
        table.add([`  ${log.gray(key)}  `, `  ${log.gray(param)}`]);
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
    const rules = webpack.module?.rules || [];
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
    log.info.cyan('Webpack: Rules');
    rules.forEach((rule) => {
      log.info.yellow(`${rule.test?.source || '<no-test>'}`);
      log.info(rule.use);
      log.info();
    });

    log.info();
    log.info.cyan('Webpack: Module Federation');
    log.info(mf?._options);

    log.info();
    return logger;
  },

  errorAndExit(code: number, ...message: (string | undefined)[]) {
    log.info();
    message.forEach((msg, i) => {
      msg = i === 0 ? `${log.red('FAILED')}\n${msg}` : msg;
      log.info.yellow(msg || '');
    });
    log.info();
    process.exit(code);
  },
};
