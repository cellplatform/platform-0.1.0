// tslint:disable

import { exec } from '..';
import chalk from 'chalk';

export async function run() {
  const colors = ['cyan', 'magenta', 'yellow', 'green', 'blue', 'red'].map(color =>
    chalk[color](color),
  );

  const cmd1 = 'echo foo';
  const cmd2 = `echo ${colors.join(' ')}`;
  const res = await exec.cmd.runList([cmd1, cmd2]);
  console.log('-------------------------------------------');
  console.log('list result:', res);
}
