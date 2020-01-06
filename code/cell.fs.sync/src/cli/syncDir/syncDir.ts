import { debounceTime, filter } from 'rxjs/operators';

import { defaultValue, log, promptConfig, watch } from '../common';
import { runSync } from './syncDir.sync';
import * as t from './types';
import * as util from './util';

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

  const sync = async (override: Partial<t.IRunSyncArgs> = {}) => {
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
    const dir$ = watch.start({ pattern: `${dir}/*` }).events$.pipe(
      filter(e => e.isFile),
      filter(e => !e.name.startsWith('.')),
      debounceTime(1000),
    );

    dir$.subscribe(async e => {
      const { count, results, errors } = await sync({ silent: true });
      const { uploaded, deleted } = count;
      if (!silent) {
        let output = '';
        if (uploaded > 0) {
          output = `uploaded ${uploaded} ${util.plural.file.toString(uploaded)}`;
          output = `${output}: ${results.uploaded.join(', ')}`;
        }
        if (deleted > 0) {
          output = output ? `${output}, ` : output;
          output = `deleted  ${deleted} ${util.plural.file.toString(deleted)}`;
          output = `${output}: ${results.deleted.join(', ')}`;
        }
        output = output.trim();

        if (output) {
          let bullet = log.cyan;
          if (uploaded > 0 && deleted > 0) {
            bullet = log.yellow;
          }
          if (uploaded > 0 && deleted === 0) {
            bullet = log.green;
          }
          if (uploaded === 0 && deleted > 0) {
            bullet = log.red;
          }
          log.info.gray(`${bullet('•')} ${output}`);
        }

        if (errors.length > 0) {
          const errs = errors.map(item => item.error);
          log.info.yellow(`${log.yellow('•')} ${errs}`);
        }
      }
    });
  } else {
    // Run the task.
    const res = await sync();

    // Finish up.
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
