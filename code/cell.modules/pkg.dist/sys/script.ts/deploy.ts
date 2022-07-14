import { prompt } from '@platform/cli.prompt';
import { exec } from '@platform/exec';
import { BuildAll } from './BuildAll';

const Imports = {
  'sys.libs': () => import('./run-sys.libs'),
  'sys.runtime': () => import('./run-sys.runtime'),
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
      { name: 'build: typescript modules', value: 'build.all' },
      { name: 'bundle: webpack', value: 'bundle' },
      ...deployKeys.map((value) => ({ name: `deploy: "${value}"`, value: `deploy.${value}` })),
    ],
  });

  /**
   * Compile module typescript.
   */
  if (selection.includes('build.all')) {
    const res = await BuildAll.run({ parentDir: '../../pkg.sys' });
    exitOnError(res.code);
  }

  /**
   * Local Bundle
   */
  if (selection.includes('bundle')) {
    const res = await exec.command('yarn bundle').run();
    exitOnError(res.code);
  }

  /**
   * Run deployments.
   */
  const deployScripts = selection
    .filter((value) => value.startsWith('deploy.'))
    .map((value) => value.replace(/^deploy\./, ''))
    .filter((key) => deployKeys.includes(key))
    .map((key) => Imports[key]);

  for (const script of deployScripts) {
    await script();
  }
})();
