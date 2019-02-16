import { exec, fs } from '../common';

(async () => {
  const argv = process.argv;
  const dir = 'example/pkg-1';
  const outDir = fs.resolve('tmp/dist');
  const options = `--dir=${dir} --outDir=${outDir} ${argv.slice(3).join(' ')}`;

  const cmd = `node bin ${argv[2]} ${options}`;
  await exec.cmd.run(cmd);
})();
