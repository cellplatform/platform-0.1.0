import { prompt } from '@platform/cli.prompt';
import { exec } from '@platform/exec';
import { Cmds } from './Cmds';
import { log } from './common';

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
      { name: '🌳 bundle: "sys.libs"', value: 'bundle.sys.libs' },
      ...deployKeys.map((value) => ({ name: `🚀 deploy: "${value}"`, value: `deploy.${value}` })),
      { name: 'all', value: 'all' },
    ],
  });

  const isSelected = (...value: string[]) => value.some((value) => selection.includes(value));

  /**
   * Compile module typescript.
   */
  if (isSelected('build.all', 'all')) {
    log.info.gray(`compiling ${log.white('typescript')}:`);
    const res = await Cmds.buildAll({ within: '../../pkg.sys' });
    exitOnError(res.code);
  }

  /**
   * Webpack bundling.
   */
  if (isSelected('bundle.sys.libs', 'all')) {
    const cmd = `yarn bundle`;
    const res = await exec.command(cmd).run();
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

  for (const dynamicImport of deployScripts) {
    const script = (await dynamicImport).default;
    await script();
  }
})();
