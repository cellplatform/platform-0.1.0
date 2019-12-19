import { cli, Client, fs, log, Schema, t, Value, util } from '../common';
import { promptConfig } from '../config';

type Status = 'ADDED' | 'CHANGED' | 'NO_CHANGE' | 'DELETED';
type PayloadItem = {
  status: Status;
  isPending: boolean;
  filename: string;
  path: string;
  url: string;
  data?: Buffer;
  bytes: number;
};

/**
 * TODO 🐷
 * - Refactor: Move generalized CLI builder stuff into `@platform/cli`
 * - DELETE file (verb)
 */

/**
 * Synchronize a folder with the cloud.
 */

export async function syncDir(args: {
  dir: string;
  force: boolean;
  silent: boolean;
  config: boolean;
  delete: boolean;
}) {
  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir, force: args.config });
  if (!config.isValid) {
    return;
  }

  const { silent = false, force = false } = args;
  const { dir, targetUri } = config;
  const host = config.data.host;
  const client = Client.create(host);
  const urls = Schema.url(host);

  if (!silent) {
    const uri = config.targetUri.parts;
    log.info();
    log.info.gray(`host:   ${config.data.host}`);
    log.info.gray(`target: cell:${uri.ns}!${log.white(uri.key)}`);
    if (force) {
      log.info.gray(`force:  ${log.cyan(true)}`);
    }
    log.info();
  }

  const payload = await buildPayload({
    dir,
    urls,
    targetUri,
    client,
    force,
    delete: args.delete,
  });
  if (!silent) {
    payload.log();
    log.info();
  }

  // Exit if no changes to push.
  if (!force && payload.items.filter(item => item.isPending).length === 0) {
    const gray = log.info.gray;
    gray(`Nothing to sync.`);
    gray(`• Use ${log.cyan('--force')} to push everything (even if file is already on server).`);
    gray(`• Use ${log.cyan('--delete')} to sync deletions.`);
    log.info();
    return;
  }

  // Filter on set of items to push.
  const changes = payload.items
    .filter(item => item.status !== 'DELETED')
    .filter(item => (force ? true : item.status !== 'NO_CHANGE'))
    .filter(item => Boolean(item.data));
  const deletions = payload.items.filter(item => args.delete && item.status === 'DELETED');
  const total = changes.length + deletions.length;

  const plural = {
    change: util.plural('change', 'changes'),
    file: util.plural('file', 'files'),
  };

  if (!silent) {
    const message = `sync ${total} ${plural.change.toString(total)}`;
    const res = await cli.prompt.list({ message, items: ['yes', 'no'] });
    if (res === 'no') {
      log.info();
      log.info.gray(`cancelled (no change).`);
      return;
    }
  }

  // Pepare tasks.
  const tasks = cli.tasks();
  const count = { uploaded: 0, deleted: 0 };
  const title = {
    upload: `Upload ${changes.length} ${plural.file.toString(changes.length)}`,
  };

  tasks.task(title.upload, async () => {
    const uri = config.targetUri.toString();
    const clientFiles = client.cell(uri).files;

    // Changes.
    const uploadFiles = changes
      .filter(item => item.status !== 'DELETED')
      .map(({ filename, data }) => ({
        filename,
        data,
      })) as t.IClientCellFileUpload[];

    if (uploadFiles.length > 0) {
      const res = await clientFiles.upload(uploadFiles);
      if (res.ok) {
        count.uploaded += uploadFiles.length;
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
        count.deleted += deleteFiles.length;
      } else {
        const err = `${res.status} Failed while deleting.`;
        throw new Error(err);
      }
    }
  });

  // Execute upload.
  const res = await tasks.run({ concurrent: true, silent });

  // Finish up.
  if (!silent) {
    log.info();
    if (res.ok) {
      const { uploaded, deleted } = count;
      const success = `${log.green('success')} (${uploaded} uploaded, ${deleted} deleted)`;
      log.info.gray(success);
      log.info();
    } else {
      res.errors.forEach(err => log.warn(err.error));
      log.info();
    }
  }
  return res;
}

/**
 * [Helpers]
 */

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

async function buildPayload(args: {
  dir: string;
  urls: t.IUrls;
  targetUri: t.IUriParts<t.ICellUri>;
  client: t.IClient;
  delete: boolean;
  force: boolean;
}) {
  const cellUri = args.targetUri.toString();
  const cellUrls = args.urls.cell(cellUri);

  const remoteFiles = (await args.client.cell(cellUri).files.list()).body;
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
    const item: PayloadItem = { status, isPending, filename, path, url, data, bytes };
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
    items,
    log() {
      const table = log.table({ border: false });
      items.forEach(item => {
        const { bytes } = item;
        const urlPath = item.url
          .substring(0, item.url.lastIndexOf('/'))
          .replace(/^http\:\/\//, '')
          .replace(/^https\:\/\//, '');

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
