import { defaultValue, log, promptConfig } from '../common';
import { runSync } from './syncDir.sync';
import { watchDir } from './syncDir.watch';
import * as t from './types';

const MAX_PAYLOAD_BYTES = 4 * 1000000; // 4MB

/**
 * TODO 🐷
 * - Refactor: Move generalized CLI builder stuff into `@platform/cli`
 */

/**
 * Synchronize a folder with the cloud.
 */
export async function syncDir(args: {
  dir: string;
  force: boolean;
  silent: boolean;
  delete: boolean;
  watch: boolean;
}) {
  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir });
  if (!config.isValid) {
    return;
  }

  const { silent = false, force = false } = args;
  const { dir } = config;

  if (!silent) {
    const uri = config.target.uri.parts;
    log.info();
    log.info.gray(`host:     ${config.data.host}`);
    log.info.gray(`target:   cell:${uri.ns}!${log.blue(uri.key)}`);
    if (args.watch) {
      log.info.gray(`watching: ${log.cyan('active')}`);
    }
    if (force) {
      log.info.gray(`force:    ${log.cyan(true)}`);
    }
    log.info();
  }

  const sync: t.RunSyncCurry = async (override: Partial<t.IRunSyncArgs> = {}) => {
    return runSync({
      config,
      dir,
      force,
      silent,
      delete: defaultValue(args.delete, false),
      maxBytes: MAX_PAYLOAD_BYTES,
      ...override,
    });
  };

  if (args.watch) {
    // Watch directory.
    await watchDir({ dir, sync, silent });
  } else {
    // Run the task.
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
