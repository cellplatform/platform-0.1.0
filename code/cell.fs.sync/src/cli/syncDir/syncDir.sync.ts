import { cli, Client, log, Schema, defaultValue } from '../common';
import { buildPayload } from './syncDir.payload';
import * as t from './types';

import { toBatches, addTask } from './syncDir.task';
import * as util from './util';

const gray = log.info.gray;

/**
 * Ryns a sync operation.
 */
export const runSync: t.RunSync = async (args: t.IRunSyncArgs) => {
  const { config, maxBytes } = args;
  const { silent = false, force = false } = args;
  const dir = config.dir;
  const targetUri = config.target.uri;
  const host = config.data.host;
  const client = Client.create(host);
  const urls = Schema.url(host);

  const payload = await buildPayload({
    dir,
    urls,
    targetUri,
    client,
    force,
    delete: args.delete,
    silent,
  });

  if (!silent) {
    payload.log();
  }

  const results: t.ISyncResults = {
    uploaded: [] as string[],
    deleted: [] as string[],
  };
  const logResults: t.LogSyncResults = args => {
    results.uploaded = [...results.uploaded, ...(args.uploaded || [])];
    results.deleted = [...results.deleted, ...(args.deleted || [])];
  };

  const count: t.ISyncCount = {
    get uploaded() {
      return results.uploaded.length;
    },
    get deleted() {
      return results.deleted.length;
    },
    get total() {
      return count.uploaded + count.deleted;
    },
  };

  const done = (completed: boolean, errors: cli.ITaskError[] = []) => {
    const ok = errors.length === 0;
    const bytes = util.toPayloadSize(pushes).bytes;
    const res: t.IRunSyncResponse = { ok, errors, count, bytes, completed, results };
    return res;
  };

  // Exit if payload not OK.
  if (!payload.ok) {
    return done(false);
  }

  // Exit if no changes to push.
  if (!silent && !force && payload.items.filter(item => item.isPending).length === 0) {
    log.info();
    log.info.green(`Nothing to update\n`);
    gray(`• Use ${log.cyan('--force (-f)')} to push everything`);

    const deletions = payload.items.filter(p => p.status === 'DELETED').length;
    if (deletions > 0) {
      gray(`• Use ${log.cyan('--delete')} to sync deletions`);
    }

    log.info();
    return done(false);
  }

  // Filter on set of items to push.
  const pushes = payload.items
    .filter(item => item.status !== 'DELETED')
    .filter(item => (force ? true : item.status !== 'NO_CHANGE'))
    .filter(item => Boolean(item.data));
  const deletions = payload.items.filter(item => args.delete && item.status === 'DELETED');
  const total = pushes.length + deletions.length;

  if (args.prompt && !silent) {
    let message = `sync ${total} ${util.plural.change.toString(total)}`;
    const size = util.toPayloadSize(pushes).toString();
    message = pushes.length === 0 ? message : `${message}, ${size}`;
    log.info();
    const res = await cli.prompt.list({ message, items: ['yes', 'no'] });
    log.info();
    if (res === 'no') {
      log.info.gray(`cancelled (no change).`);
      return done(false);
    }
  }

  // Pepare tasks.
  const tasks = cli.tasks();
  const batches = toBatches({
    items: [...pushes, ...deletions],
    maxBytes,
  });

  batches.forEach(items => {
    addTask({
      tasks,
      items,
      client,
      targetUri,
      logResults,
    });
  });

  // Execute upload.
  const res = await tasks.run({ concurrent: false, silent });
  return done(true, res.errors);
};
