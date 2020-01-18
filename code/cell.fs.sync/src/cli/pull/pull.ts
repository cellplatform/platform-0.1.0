import { log, t } from '../common';
import { syncDir } from '../syncDir';

/**
 * Pull folder from remote.
 */
export async function pull(args: { dir: string }) {
  const { dir } = args;

  console.log('PULL', dir);

  // await syncDir({
  //   dir,
  //   silent: false,
  //   force: false,
  //   delete: true,
  //   watch: true,
  //   keyboard,
  // });
}
