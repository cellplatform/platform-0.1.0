import { debounceTime, filter } from 'rxjs/operators';
import {
  cli,
  Client,
  defaultValue,
  fs,
  log,
  Schema,
  t,
  util,
  Value,
  watch,
  promptConfig,
} from '../common';

type IRunSyncArgs = {
  config: t.IFsConfigDir;
  dir: string;
  force: boolean;
  silent: boolean;
  delete: boolean;
};
type SyncCount = {
  readonly total: number;
  readonly uploaded: number;
  readonly deleted: number;
};
type Status = 'ADDED' | 'CHANGED' | 'NO_CHANGE' | 'DELETED';
type IPayloadItem = {
  status: Status;
  isPending: boolean;
  filename: string;
  path: string;
  url: string;
  data?: Buffer;
  bytes: number;
};

const gray = log.info.gray;

const plural = {
  change: util.plural('change', 'changes'),
  file: util.plural('file', 'files'),
};

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
    log.info.gray(`target:   cell:${uri.ns}!${log.white(uri.key)}`);
    if (args.watch) {
      log.info.gray(`watching: active`);
    }
    if (force) {
      log.info.gray(`force:    ${log.cyan(true)}`);
    }
    log.info();
  }

  const sync = async (override: Partial<IRunSyncArgs> = {}) => {
    return runSync({
      config,
      dir,
      force,
      silent,
      delete: defaultValue(args.delete, false),
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
          output = `uploaded ${uploaded} ${plural.file.toString(uploaded)}`;
          output = `${output}: ${results.uploaded.join(', ')}`;
        }
        if (deleted > 0) {
          output = output ? `${output}, ` : output;
          output = `deleted  ${deleted} ${plural.file.toString(deleted)}`;
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

/**
 * [Helpers]
 */

async function runSync(args: IRunSyncArgs) {
  const { config } = args;
  const { silent = false, force = false } = args;
  const { dir, target } = config;
  const host = config.data.host;
  const client = Client.create(host);
  const urls = Schema.url(host);

  const payload = await buildPayload({
    dir,
    urls,
    targetUri: target.uri,
    client,
    force,
    delete: args.delete,
    silent,
  });

  if (!silent) {
    payload.log();
    log.info();
  }

  const results = {
    uploaded: [] as string[],
    deleted: [] as string[],
  };
  const count: SyncCount = {
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

  // Exit if payload not OK
  if (!payload.ok) {
    return done(false);
  }

  // Exit if no changes to push.
  if (!silent && !force && payload.items.filter(item => item.isPending).length === 0) {
    log.info.yellow(`Nothing to sync`);
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
    let message = `sync ${total} ${plural.change.toString(total)}`;
    message = pushes.length === 0 ? message : `${message}, ${toPayloadSize(pushes).toString()}`;
    const res = await cli.prompt.list({ message, items: ['yes', 'no'] });
    if (res === 'no') {
      log.info();
      log.info.gray(`cancelled (no change).`);
      return done(false);
    }
  }

  // Pepare tasks.
  const tasks = cli.tasks();

  const toPayloadTitle = (items: IPayloadItem[]) => {
    const size = toPayloadSize(items);
    const total = pushes.length + deletions.length;
    let title = `${total} ${plural.file.toString(total)}`;
    title = size.bytes === 0 ? title : `${title}, ${size.toString()}`;
    return title;
  };

  const title = toPayloadTitle(pushes);
  tasks.task(title, async () => {
    const uri = config.target.uri.toString();
    const clientFiles = client.cell(uri).files;

    // Changes.
    const uploadFiles = pushes
      .filter(item => item.status !== 'DELETED')
      .map(({ filename, data }) => ({
        filename,
        data,
      })) as t.IClientCellFileUpload[];

    if (uploadFiles.length > 0) {
      const res = await clientFiles.upload(uploadFiles);
      if (res.ok) {
        // count.uploaded += uploadFiles.length;
        results.uploaded = [...results.uploaded, ...uploadFiles.map(item => item.filename)];
      } else {
        const err = `${res.status} Failed while uploading.`;
        throw new Error(err);
      }
    }

    // Deletions.
    const deleteFiles = deletions
      .filter(item => item.status === 'DELETED')
      .map(item => item.filename);

    if (deleteFiles.length > 0) {
      const res = await clientFiles.delete(deleteFiles);
      if (res.ok) {
        results.deleted = [...results.deleted, ...deleteFiles];
      } else {
        const err = `${res.status} Failed while deleting.`;
        throw new Error(err);
      }
    }
  });

  // Execute upload.
  const res = await tasks.run({ concurrent: true, silent });

  // Finish up.
  return done(true, res.errors);
}

function toStatusColor(args: { status: Status; text?: string; delete?: boolean; force?: boolean }) {
  const { status } = args;
  const text = args.text || status;
  switch (status) {
    case 'ADDED':
      return log.green(text);
    case 'CHANGED':
      return log.yellow(text);
    case 'NO_CHANGE':
      return args.force ? log.cyan(text) : log.gray(text);
    case 'DELETED':
      return args.delete ? log.red(text) : log.gray(text);
    default:
      return text;
  }
}

const toPayloadSize = (items: IPayloadItem[]) => {
  const bytes = items
    .filter(item => item.bytes > -1)
    .map(item => item.bytes)
    .reduce((acc, next) => acc + next, 0);
  return {
    bytes,
    toString: () => fs.size.toString(bytes),
  };
};

async function buildPayload(args: {
  dir: string;
  urls: t.IUrls;
  targetUri: t.IUriParts<t.ICellUri>;
  client: t.IClient;
  delete: boolean;
  force: boolean;
  silent: boolean;
}) {
  const { silent } = args;
  let ok = true;
  const host = args.client.origin;
  const cellUri = args.targetUri.toString();
  const cellKey = args.targetUri.parts.key;
  const cellUrls = args.urls.cell(cellUri);

  // Retrieve the list of remote files.
  let remoteFiles: t.IClientFileData[] = [];
  const tasks = cli.tasks();
  tasks.task(`Read [${cellKey}] from ${host}`, async () => {
    const res = await args.client.cell(cellUri).files.list();
    if (!res.ok) {
      throw new Error(res.error?.message);
    }
    remoteFiles = res.body;
  });

  const taskRes = await tasks.run({ silent });
  if (!taskRes.ok) {
    ok = false;
    // return;
  }

  if (!silent) {
    log.info();
  }

  const findRemote = (filename: string) => remoteFiles.find(f => f.props.filename === filename);

  // Prepare files.
  const paths = await fs.glob.find(`${args.dir}/*`, { dot: false, includeDirs: false });
  const wait = paths.map(async path => {
    const data = await fs.readFile(path);
    const bytes = Uint8Array.from(data).length;

    const filename = fs.basename(path);
    const remoteFile = findRemote(filename);

    const hash = {
      local: Value.hash.sha256(data),
      remote: remoteFile ? remoteFile.props.filehash : '',
    };

    let status: Status = 'ADDED';
    if (remoteFile) {
      status = hash.local === hash.remote ? 'NO_CHANGE' : 'CHANGED';
    }

    const url = cellUrls.file.byName(filename).toString();
    const isPending = status !== 'NO_CHANGE';
    const item: IPayloadItem = { status, isPending, filename, path, url, data, bytes };
    return item;
  });
  const items = await Promise.all(wait);

  // Add list of deleted files (on remote, but not local).
  const isDeleted = (filename?: string) => !items.some(item => item.filename === filename);
  remoteFiles
    .filter(file => Boolean(file.props.filename))
    .filter(file => isDeleted(file.props.filename))
    .forEach(file => {
      const filename = file.props.filename || '';
      const path = '';
      const url = cellUrls.file.byName(filename).toString();
      const isPending = args.delete;
      items.push({ status: 'DELETED', isPending, filename, path, url, bytes: -1 });
    });

  // Finish up.
  return {
    ok,
    items,
    log() {
      const table = log.table({ border: false });
      items.forEach(item => {
        const { bytes } = item;
        const urlPath = util.url.stripHttp(item.url.substring(0, item.url.lastIndexOf('/')));
        const filename = toStatusColor({
          status: item.status,
          text: item.filename,
          delete: args.delete,
          force: args.force,
        });

        const url = log.gray(`${urlPath}/${filename}`);

        const statusText = item.status.toLowerCase().replace(/\_/g, ' ');

        const status = toStatusColor({
          status: item.status,
          text: statusText,
          delete: args.delete,
          force: args.force,
        });

        const size = bytes > -1 ? fs.size.toString(bytes) : '';

        table.add([`${status}  `, `${url}  `, size]);
      });
      log.info(table.toString());
    },
  };
}
