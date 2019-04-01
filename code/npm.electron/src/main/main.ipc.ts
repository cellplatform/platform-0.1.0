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

    const dir = fs.join(app.getPath('desktop'), 'TMP');
    await fs.ensureDir(dir);

    console.log('dir', dir);

    const cmd = exec.command('npm install express');

    console.log('cmd.toString()', cmd.toString());

    const res = await cmd.run({ dir });
    console.log('-------------------------------------------');
    console.log('res', res);
  });
}
