import { constants } from '../app/src/main/common';
import { bundleModules } from './bundle.ui.lib';
import { prompt } from '@platform/cli.prompt';
import { log } from '@platform/log/lib/server';

(async () => {
  var argv = process.argv.slice(2);
  const isSilent = argv.includes('--silent') || argv.includes('-s');

  let modules = ['cell.ui.sys', 'cell.ui.finder', 'cell.ui.ide'];

  if (!isSilent) {
    const res = await prompt.checkbox({ message: 'modules', items: modules });
    if (res.length === 0) {
      return log.info.gray(`\nNo modules selected.`);
    }
    modules = modules.filter((name) => res.includes(name));
  }

  const target = constants.paths.bundle;
  const args = modules.map((name) => ({ sourceDir: `../${name}`, targetDir: target[name] }));
  await bundleModules(args);
})();
