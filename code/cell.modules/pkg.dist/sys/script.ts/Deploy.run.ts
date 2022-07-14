import { prompt } from '@platform/cli.prompt';
import { exec } from '@platform/exec';
import { Cmds } from './Cmds';

const Imports = {
  'sys.libs': import('./Deploy-sys.libs'),
  'sys.runtime': import('./Deploy-sys.runtime'),
};

/**
 * Prompt user for actions to perform.
 */
(async () => {
  const deployKeys = Object.keys(Imports);
  const exitOnError = (code: number) => {
    if (code !== 0) process.exit(code);
  };

  const selection = await prompt.checkbox({
    message: 'run',
    items: [
      { name: 'compile all typescript modules (in "pkg.sys")', value: 'build.all' },
      { name: 'bundle: local webpack', value: 'bundle' },
      ...deployKeys.map((value) => ({ name: `deploy: "${value}"`, value: `deploy.${value}` })),
      { name: 'all', value: 'all' },
    ],
  });

  const isSelected = (...value: string[]) => value.some((value) => selection.includes(value));

  /**
   * Compile module typescript.
   */
  if (isSelected('build.all', 'all')) {
    const res = await Cmds.buildAll({ within: '../../pkg.sys' });
    exitOnError(res.code);
  }

  /**
   * Local Bundle
   */
  if (isSelected('bundle', 'all')) {
    const res = await exec.command('yarn bundle').run();
    exitOnError(res.code);
  }

  /**
   * Run deployments.
   */
  let deployScripts = selection
    .filter((value) => value.startsWith('deploy.'))
    .map((value) => value.replace(/^deploy\./, ''))
    .filter((key) => deployKeys.includes(key))
    .map((key) => Imports[key]);

  if (isSelected('all')) deployScripts = Object.keys(Imports).map((key) => Imports[key]);

  const running = deployScripts.map(async (dynamicImport) => {
    const script = (await dynamicImport).default;
    await script();
  });
  await Promise.all(running);
})();
