import { cli, Client, log, Schema } from '../common';
import { buildPayload, toPayloadSize } from './syncDir.payload';
import * as t from './types';

import { toBatches, addTask } from './syncDir.task';
import * as util from './util';

// const MAX_PAYLOAD_BYTES = 4 * 1000000; // 4MB
const gray = log.info.gray;

/**
 * Ryns a sync operation.
 */
export async function runSync(args: t.IRunSyncArgs) {
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

  const results = {
    uploaded: [] as string[],
    deleted: [] as string[],
  };
  const logResults: t.LogResults = args => {
    results.uploaded = [...results.uploaded, ...(args.uploaded || [])];
    results.deleted = [...results.deleted, ...(args.deleted || [])];
  };

  const count: t.SyncCount = {
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
    return { ok, errors, count, completed, payload, results };
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

  if (!silent) {
    let message = `sync ${total} ${util.plural.change.toString(total)}`;
    message = pushes.length === 0 ? message : `${message}, ${toPayloadSize(pushes).toString()}`;
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
}
