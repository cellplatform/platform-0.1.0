import { exec } from '@platform/exec';
import { log } from '@platform/log/lib/server';
import { value } from '@platform/util.value';

const { defaultValue } = value;
const pkg = require('../../package.json') as { devDependencies: { [key: string]: string } };

/**
 * Runs the build command.
 *
 * Background:
 *   - https://electronjs.org/docs/tutorial/using-native-node-modules
 *
 * Requires `libtool`:
 *   - brew install libtool
 *
 * Found via similar fix in Beaker Browser:
 *   - https://github.com/beakerbrowser/beaker/blob/master/tasks/rebuild.js
 *   - https://github.com/electron/electron/issues/5851
 *
 */
export async function rebuild(options: { silent?: boolean; run?: boolean; cwd?: string } = {}) {
  const { silent, cwd } = options;
  const run = defaultValue(options.run, true);
  const { cmd, env, version } = rebuildCommand();

  const write = () => {
    if (silent) {
      return;
    }
    log.info();
    log.info.gray('electron', log.yellow(version));
    log.info.gray('env: ', env);
    log.info.gray(`command: ${log.cyan(cmd)}`);
    log.info();
  };

  if (run) {
    write();
    await exec.cmd.run(cmd, { cwd, env, silent });
    write();
  }

  return { cmd, env, version };
}

/**
 * Generates the rebuild command.
 */
export function rebuildCommand() {
  const version = pkg.devDependencies.electron;
  const env = {
    CXXFLAGS: '-mmacosx-version-min=10.10',
    LDFLAGS: '-mmacosx-version-min=10.10',
  };

  const cmd = `
  npm rebuild
      --runtime=electron
      --target=${version}
      --disturl=https://atom.io/download/atom-shell
      --build-from-source
  `;

  return { cmd, env, version };
}
