import { log } from '../common';
import { COMMANDS } from './constants';

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
};
