import { exec } from '@platform/exec';

/**
 * Background
 *   - https://electronjs.org/docs/tutorial/using-native-node-modules
 *
 * Requires `libtool`
 *   - brew install libtool
 *
 * Found via similar fix in Beaker Browser:
 *   - https://github.com/beakerbrowser/beaker/blob/master/tasks/rebuild.js
 *   - https://github.com/electron/electron/issues/5851
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
