import { log, t } from '../common';
import { syncDir } from '../syncDir';

const gray = log.info.gray;

/**
 * Synchronise folder in watch mode.
 */
export async function syncWatch(args: { dir: string; keyboard?: t.ICmdKeyboard }) {
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
