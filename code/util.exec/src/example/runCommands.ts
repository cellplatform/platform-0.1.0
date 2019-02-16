// tslint:disable

import { exec } from '..';
import chalk from 'chalk';

(async () => {
  const cmd1 = 'echo foo';
  const cmd2 = `echo ${chalk.yellow('bar')}`;
  const res = await exec.cmd.runList([cmd1, cmd2]);
  console.log('-------------------------------------------');
  console.log('res', res);
})();
