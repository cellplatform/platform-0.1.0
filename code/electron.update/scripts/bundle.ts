import { log, exec, fs } from './common';
import { Bundle } from '../src/main';

(async () => {
  await exec.cmd.run('npm version patch');
  await exec.cmd.run('yarn ui bundle');

  const res = await Bundle.zip({
    source: {
      main: './.uiharness/bundle/app.main',
      renderer: './.uiharness/bundle/app.renderer/prod',
    },
    target: './tmp/bundle',
  });

  log.info(res);
  log.info();
})();
