import { fs } from '@platform/fs';
import { exec } from '@platform/exec';

/**
 * - https://electronjs.org/docs/tutorial/using-native-node-modules
 * - brew install libtool
 *
 * - Beaker
 *   https://github.com/electron/electron/issues/5851
 *   https://github.com/beakerbrowser/beaker/blob/master/tasks/rebuild.js
 *
 */
(async () => {
  const env = {
    CXXFLAGS: '-mmacosx-version-min=10.10',
    LDFLAGS: '-mmacosx-version-min=10.10',
  };

  const cmd = `npm rebuild --runtime=electron --target=5.0.0 --disturl=https://atom.io/download/atom-shell --build-from-source`;
  await exec.cmd.run(cmd, { env });
})();
