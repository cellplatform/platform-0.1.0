#!/usr/bin/env node
import { exec, fs } from '../common';

(async () => {
  const argv = process.argv;
  const cwd = 'example/pkg-1';
  const outDir = fs.resolve('tmp/dist');
  const options = `--dir=${cwd} --outDir=${outDir} ${argv.slice(3).join(' ')}`;

  const cmd = `node bin ${argv[2]} ${options}`;
  await exec.process.spawn(cmd);
})();
