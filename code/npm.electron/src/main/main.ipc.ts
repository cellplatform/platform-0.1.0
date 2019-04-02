import { t, exec, fs, npm } from './common';
import { app } from 'electron';

/**
 * Start the Npm IPC handlers listening on the [main] process.
 */
export function listen(args: { ipc: t.IpcClient; log: t.IMainLog }) {
  const ipc = args.ipc as t.NpmIpc;
  const log = args.log;
  log.info(`listening for ${log.yellow('npm events')}`);

  /**
   * [Handle] installing an NPM module
   */
  ipc.handle<t.INpmInstall>('NPM/install', async e => {
    log.info();
    log.info('Install from NPM');
    const { name } = e.payload;

    // Get version.
    const LATEST = 'latest';
    let version = e.payload.version || LATEST;
    const isLatest = version === LATEST;
    version = isLatest ? await npm.getVersion(name) : version;

    console.log(`\nTODO 🐷   install DIR NAME not 'TMP'\n`);
    const dir = fs.join(app.getPath('desktop'), 'TMP', `${name}@${version}`);

    // Log.
    const ver = log.magenta(version);
    log.info.gray(' - name:   ', log.cyan(name));
    log.info.gray(' - version:', isLatest ? `latest (${ver})` : ver);
    log.info.gray(' - dir:    ', dir);

    // Prepare the [package.json] file.
    const pkg = npm.pkg({
      json: {
        name: 'local.install',
        dependencies: {
          [name]: version,
        },
        private: true,
      },
    });
    pkg.save(dir);

    const cmd = exec.command('npm install');
    log.info.gray('installing...');
    const res = await cmd.run({ dir, silent: true });
    log.info(`Done:`, res.ok ? log.green('success') : log.red('failed'));
  });
}
