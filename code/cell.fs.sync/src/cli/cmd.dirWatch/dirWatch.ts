import { t } from '../common';
import { syncDir } from '../cmd.dirSync';

/**
 * Synchronise folder in watch mode.
 */
export async function dirWatch(args: { dir: string; keyboard?: t.ICmdKeyboard }) {
  const { dir, keyboard } = args;
  await syncDir({
    dir,
    silent: false,
    force: false,
    delete: true,
    watch: true,
    keyboard,
  });
}
