import { t, exec, fs, npm, time } from './common';
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
    try {
      const timer = time.timer();
      const { name } = e.payload;

      const node = (await exec.command('node -v').run()).info[0];

      log.info();
      log.info('node', log.yellow(node));
      log.info('Install from NPM');

      // Get version.
      const LATEST = 'latest';
      let version = e.payload.version || LATEST;
      const isLatest = version === LATEST;
      version = isLatest ? await npm.getVersion(name) : version;
      const nameVersion = `${name}@${version}`;

      log.info(`\nTODO 🐷   install DIR NAME not 'TMP'\n`);
      const dir = fs.join(app.getPath('desktop'), 'TMP', nameVersion);

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

      // Run the install.
      const cmd = exec.command('npm install');
      log.info.gray('installing...');
      const res = await cmd.run({ dir, silent: true });
      const elapsed = log.gray(`${timer.elapsed('s')}s`);
      log.info(`Done:`, res.ok ? log.green('success') : log.red('failed'), elapsed);

      // Handle error.
      if (!res.ok) {
        const dest = `${dir}.fail`;
        await fs.remove(`${dir}.fail`);
        await fs.move(dir, dest);

        res.errors.forEach(err => {
          log.info.gray(err);
        });
      }
    } catch (error) {
      const { name, version = 'latest' } = e.payload;
      log.error(`Failed while installing '${name}@${version}'. ${error.message}`);
    }
  });
}
