import { ConfigDir, defaultValue, log, promptConfig, t, util } from '../common';
import { formatLength } from '../util';
import { runSync } from './dirSync.sync';
import { watchDir } from './dirSync.watch';

const MAX_PAYLOAD_BYTES = 4 * 1000000; // 4MB
const gray = log.info.gray;

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
  openRemote?: boolean;
}) {
  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir });
  if (ConfigDir.logInvalid(config)) {
    return;
  }

  const { silent = false, force = false, keyboard } = args;
  const { dir } = config;

  if (!silent) {
    const uri = config.target.uri;
    const key = uri.parts.key;
    const keyTitle = util.log.cellKeyBg(key);
    const host = config.data.host;

    log.info(`${keyTitle}`);
    log.info();

    gray(`local:    ${formatLength(args.dir, 40)}/`);
    gray(`host:     ${host}`);
    gray(`target:   ${util.log.cellUri(uri, 'blue')}`);
    log.info();

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

    if (args.openRemote) {
      util.open(config).remote();
    }
  }
}
