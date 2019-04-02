import { t, exec, fs } from './common';
import { app } from 'electron';

/**
 * Start the Npm IPC handlers listening on the [main] process.
 */
export function listen(args: { ipc: t.IpcClient; log: t.IMainLog }) {
  const ipc = args.ipc as t.NpmIpc;
  const log = args.log;
  log.info(`listening for ${log.yellow('npm events')}`);

  /**
   * Event handler
   */
  ipc.handle<t.IFooMessage>('NPM/foo', async e => {
    console.log('e', e);
    log.info(e);

    const dir = fs.join(app.getPath('desktop'), 'TMP');
    await fs.ensureDir(dir);

    log.info('dir:', dir);

    const cmd = exec.command('npm install express');

    log.info('installing...');
    const res = await cmd.run({ dir });
    log.info('res', res);
  });
}
