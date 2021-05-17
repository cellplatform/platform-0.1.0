import { log, Logger as commonLogger, t } from '../common';
import { COMMANDS } from '../constants';

type B = t.BuilderChain<t.CompilerModelMethods>;

const { model, stats } = commonLogger;

export const Logger = {
  model,
  stats,

  clear() {
    log.clear();
    return Logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return Logger;
  },

  hr(length = 60) {
    log.info.gray('━'.repeat(length));
    return Logger;
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

    return Logger;
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
