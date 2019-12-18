import { cli, Client, fs, log, Schema, t, Value } from '../common';
import { promptConfig } from '../config';

type Status = 'NEW' | 'CHANGE' | 'NO_CHANGE' | 'DELETE';
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
  silent: boolean;
  config: boolean;
  delete: boolean;
}) {
  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir, force: args.config });
  if (!config.isValid) {
    return;
  }

  const { silent = false } = args;
  const { dir, targetUri } = config;
  const host = config.data.host;
  const client = Client.create(host);
  const urls = Schema.url(host);

  if (!silent) {
    log.info();
    log.info.gray(`host:   ${config.data.host}`);
    log.info.gray(`target: ${config.data.target}`);
    log.info();
  }

  const payload = await buildPayload({ dir, urls, targetUri, client, delete: args.delete });
  if (!silent) {
    payload.log();
    log.info();
  }

  if (payload.items.filter(item => item.isPending).length === 0) {
    return;
  }

  if (!silent) {
    const message = `change remote`;
    const res = await cli.prompt.list({ message, items: ['no', 'yes'] });
    if (res === 'no') {
      log.info();
      log.info.gray(`Cancelled (no change).`);
      return;
    }
  }

  // Execute upload.
  const tasks = cli.tasks();
  tasks.task('Upload', async () => {
    const uri = config.targetUri.toString();

    const files = payload.items
      .filter(item => item.status !== 'DELETE')
      .filter(item => Boolean(item.data))
      .map(({ filename, data }) => ({ filename, data })) as t.IClientCellFileUpload[];

    const res = await client.cell(uri).files.upload(files);
    if (!res.body) {
      const err = `${res.status} Failed upload.`;
      throw new Error(err);
    }
  });
  const res = await tasks.run({ concurrent: true, silent });

  // Finish up.
  if (!silent) {
    log.info();
    if (res.ok) {
      log.info.green('success');
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

function toStatusColor(args: { status: Status; text?: string; delete?: boolean }) {
  const { status } = args;
  const text = args.text || status;
  switch (status) {
    case 'NEW':
      return log.green(text);
    case 'CHANGE':
      return log.yellow(text);
    case 'NO_CHANGE':
      return log.gray(text);
    case 'DELETE':
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
}) {
  const cellUri = args.targetUri.toString();
  const cellUrls = args.urls.cell(cellUri);

  const remoteFiles = (await args.client.cell(cellUri).files.list()).body;
  const findRemote = (filename: string) => remoteFiles.find(f => f.props.filename === filename);

  // Prepare files.
  const paths = await fs.glob.find(`${args.dir}/*`, { dot: false, includeDirs: false });
  const wait = paths.map(async path => {
    const data = await fs.readFile(path);
    const bytes = (await fs.size.file(path)).bytes;

    const filename = fs.basename(path);
    const remoteFile = findRemote(filename);

    const hash = {
      local: Value.hash.sha256(data),
      remote: remoteFile ? remoteFile.props.filehash : '',
    };

    let status: Status = 'NEW';
    if (remoteFile) {
      status = hash.local === hash.remote ? 'NO_CHANGE' : 'CHANGE';
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
      items.push({ status: 'DELETE', isPending, filename, path, url, bytes: -1 });
    });

  // Finish up.
  return {
    items,
    log() {
      const table = log.table({ border: false });
      items.forEach(item => {
        const { bytes } = item;
        const urlPath = item.url.substring(0, item.url.lastIndexOf('/'));

        const filename = toStatusColor({
          status: item.status,
          text: item.filename,
          delete: args.delete,
        });

        const url = `${urlPath}/${filename}`;

        let statusText = item.status.toLowerCase().replace(/\_/g, ' ');
        if (!args.delete && item.status === 'DELETE') {
          statusText = `${statusText} (retain)`;
        }

        const status = toStatusColor({
          status: item.status,
          text: statusText,
          delete: args.delete,
        });

        const size = bytes > -1 ? fs.size.toString(bytes) : '';

        table.add([status, log.gray(url), size]);
      });
      log.info(table.toString());
    },
  };
}
