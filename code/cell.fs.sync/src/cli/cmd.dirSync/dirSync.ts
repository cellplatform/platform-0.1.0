import { defaultValue, log, promptConfig, t } from '../common';
import { runSync } from './dirSync.sync';
import { watchDir } from './dirSync.watch';

const MAX_PAYLOAD_BYTES = 4 * 1000000; // 4MB

/**
 * Synchronize a folder with the cloud.
 */
export async function dirSync(args: {
  dir: string;
  force: boolean;
  silent: boolean;
  delete: boolean;
  watch: boolean;
  keyboard?: t.ICmdKeyboard;
}) {
  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir });
  if (!config.isValid) {
    return;
  }

  const { silent = false, force = false, keyboard } = args;
  const { dir } = config;
  const host = config.data.host;

  if (!silent) {
    const uri = config.target.uri.parts;
    log.info();
    log.info.gray(`host:     ${host}`);
    log.info.gray(`target:   cell:${uri.ns}!${log.blue(uri.key)}`);
    if (args.watch) {
      log.info.gray(`watching: ${log.cyan('active')}`);
    }
    if (force) {
      log.info.gray(`force:    ${log.cyan(true)}`);
    }
    log.info();
  }

  const sync: t.FsSyncRunCurry = async (override: Partial<t.IFsSyncRunArgs> = {}) => {
    return runSync({
      config,
      dir,
      force,
      silent,
      delete: defaultValue(args.delete, false),
      prompt: true,
      maxBytes: MAX_PAYLOAD_BYTES,
      ...override,
    });
  };

  if (args.watch && keyboard) {
    // Watch directory.
    await watchDir({ config, sync, silent, keyboard });
  } else {
    // Run sync operation.
    const res = await sync();
    if (!silent) {
      if (res.completed) {
        log.info();
        if (res.ok) {
          const { uploaded, deleted } = res.count;
          const success = `${log.green('success')} (${uploaded} uploaded, ${deleted} deleted)`;
          log.info.gray(success);
          log.info();
        } else {
          res.errors.forEach(err => log.warn(err.error));
          log.info();
        }
      }
    }
  }
}
