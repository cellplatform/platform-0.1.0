import { cli, Client, fs, log, Schema, t, Value } from '../common';
import { promptConfig } from '../config';

type Status = 'NEW' | 'CHANGE' | 'NO_CHANGE' | 'DELETE';
type PayloadItem = {
  status: Status;
  filename: string;
  path: string;
  url: string;
  data?: Buffer;
};

/**
 * TODO 🐷
 * - Refactor: Move generalized CLI builder stuff into `@platform/cli`
 * - DELETE file (verb)
 */

/**
 * Synchronize a folder with the cloud.
 */

const ns = 'ck499h7u30000fwet3k7085t1';

export async function syncDir(args: {
  dir: string;
  dryRun: boolean;
  silent: boolean;
  config: boolean;
  delete: boolean;
}) {
  // Retrieve (or build) configuration file the directory.
  const config = await promptConfig({ dir: args.dir, force: args.config });
  if (!config.isValid) {
    return;
  }

  const { dryRun = false, silent = false } = args;
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

  if (!silent) {
    const message = `change remote`;
    const res = await cli.prompt.list({ message, items: ['no', 'yes'] });
    if (res === 'no') {
      log.info();
      log.info.gray(`Cancelled (no change).`);
      return;
    }
  }

  /**
   * TODO 🐷
   * - post files all at once.
   *
   */

  const tasks = cli.tasks();

  payload.items
    .filter(item => item.status !== 'DELETE')
    .filter(item => Boolean(item.data))
    .forEach(item => {
      tasks.task(item.filename, async () => {
        const uri = config.targetUri.toString();
        const file = client.cell(uri).file.name(item.filename);
        if (item.data) {
          const res = await file.upload(item.data);

          // throw new Error(res.status.toString());

          if (!res.ok) {
            // res.body.data.
            const err = `${res.status} Failed upload.`;
            throw new Error(err);
          }
        }
        // const res = await client
        //   .cell(uri)
        //   .file.name(item.filename)
        //   .upload(item.data);
      });
    });

  const res = await tasks.run({ concurrent: true, silent });

  console.log('res', res);

  // tasks.task()

  // tasks.

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
    const item: PayloadItem = { status, filename, path, url, data };
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
      items.push({ status: 'DELETE', filename, path, url });
    });

  // Finish up.
  return {
    items,
    log() {
      const table = log.table({ border: false });
      items.forEach(item => {
        const { filename } = item;
        const urlPath = item.url.substring(0, item.url.lastIndexOf('/'));
        const url = `${urlPath}/${log.cyan(filename)}`;

        let statusText = item.status.toLowerCase().replace(/\_/g, ' ');
        if (!args.delete && item.status === 'DELETE') {
          statusText = `${statusText} (retain)`;
        }

        const status = toStatusColor({
          status: item.status,
          text: statusText,
          delete: args.delete,
        });

        table.add([status, log.gray(url)]);
      });
      log.info(table.toString());
    },
  };
}
