import { constants } from '../app/src/main/common';
import { bundleModules } from './bundle.ui.lib';
import { prompt } from '@platform/cli.prompt';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

(async () => {
  var argv = process.argv.slice(2);
  const isSilent = argv.includes('--silent') || argv.includes('-s');

  type Reset = 'yes' | 'no';

  let modules = ['cell.ui.sys', 'cell.ui.finder', 'cell.ui.ide'];
  let reset: Reset = 'no';

  if (!isSilent) {
    const selectModules = await prompt.checkbox({ message: 'modules', items: ['all', ...modules] });
    if (selectModules.length === 0) {
      return log.info.gray(`\nNo modules selected.`);
    }
    if (!selectModules.includes('all')) {
      modules = modules.filter((name) => selectModules.includes(name));
    }

    reset = await prompt.radio<Reset>({ message: 'reset data', items: ['yes', 'no'] });
  }

  const target = constants.paths.bundle;
  const args = modules.map((name) => ({ sourceDir: `../${name}`, targetDir: target[name] }));
  await bundleModules(args);

  if (reset) {
    const path = constants.paths.data({ prod: false });
    await fs.remove(path.dir);
  }
})();
