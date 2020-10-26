
import { exec } from '@platform/exec';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

const path = fs.resolve('./dist/node/main.js');
const cmd = `node ${path}`;
log.info.gray(`${log.green('RUN')} ${cmd}`);
log.info('');

/**
 * TODO 🐷
 * Turn this into a proper command ??
 * - /node/boot
 */

(async () => {
  const res = await exec.command(cmd).run();
  const code = res.code === 0 ? log.green(0) : log.red(res.code);
  log.info();
  log.info.gray(`status code: ${code}`);


})();
