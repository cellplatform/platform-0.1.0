import { cli, HttpClient, log, t } from '../common';
import { getPayload } from './dirSync.payload';
import { addTask, toBatches } from './dirSync.sync.task';
import * as util from '../util';

const gray = log.info.gray;

/**
 * Ryns a sync operation.
 */
export const runSync: t.FsSyncRun = async (args: t.IFsSyncRunArgs) => {
  const { config, maxBytes, onPayload } = args;
  const { silent = false, force = false } = args;
  const targetUri = config.target.uri;
  const host = config.data.host;
  const client = HttpClient.create(host);
  const payload = await getPayload({ config, silent, force, delete: args.delete });

  if (onPayload) {
    onPayload(payload);
  }

  if (!silent) {
    log.info(payload.log());
  }

  const results: t.IFsSyncResults = {
    uploaded: [] as string[],
    deleted: [] as string[],
  };

  const logResults: t.FsSyncLogResults = args => {
    results.uploaded = [...results.uploaded, ...(args.uploaded || [])];
    results.deleted = [...results.deleted, ...(args.deleted || [])];
  };

  const count: t.IFsSyncCount = {
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
    const res: t.IFsRunSyncResponse = { ok, errors, count, bytes, completed, results };
    return res;
  };

  // Exit if payload not OK.
  if (!payload.ok) {
    return done(false);
  }

  // Exit if no changes to push.
  if (!silent && !force && payload.files.filter(item => item.isChanged).length === 0) {
    log.info();
    log.info.green(`Nothing to update\n`);
    gray(`• Use ${log.cyan('--force (-f)')} to push everything`);

    const deletions = payload.files.filter(p => p.status === 'DELETED').length;
    if (deletions > 0) {
      gray(`• Use ${log.cyan('--delete')} to sync deletions`);
    }

    log.info();
    return done(false);
  }

  // Filter on set of items to push.
  const pushes = payload.files
    .filter(item => item.status !== 'DELETED')
    .filter(item => (force ? true : item.status !== 'NO_CHANGE'))
    .filter(item => Boolean(item.data));
  const deletions = payload.files.filter(item => args.delete && item.status === 'DELETED');
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
