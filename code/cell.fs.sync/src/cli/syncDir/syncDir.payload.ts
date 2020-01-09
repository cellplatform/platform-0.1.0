import { cli, fs, log, Schema, Value } from '../common';
import * as t from './types';
import * as util from './util';

/**
 * Builds the sync payload.
 */
export async function buildPayload(args: {
  dir: string;
  urls: t.IUrls;
  targetUri: t.IUriParts<t.ICellUri>;
  client: t.IClient;
  delete: boolean;
  force: boolean;
  silent: boolean;
}) {
  const { silent, client } = args;
  let ok = true;
  const cellUri = args.targetUri.toString();
  const cellKey = args.targetUri.parts.key;
  const cellUrls = args.urls.cell(cellUri);

  // Retrieve the list of remote files.
  let remoteFiles: t.IClientFileData[] = [];
  const findRemote = (filename: string) => remoteFiles.find(f => f.props.filename === filename);

  const urls = Schema.url(client.origin);
  const filesUrl = urls.cell(cellUri).files.list;

  const tasks = cli.tasks();
  tasks.task(`Read [${cellKey}] from ${filesUrl.toString()}`, async () => {
    const res = await args.client.cell(cellUri).files.list();
    if (!res.ok) {
      throw new Error(res.error?.message);
    }
    remoteFiles = res.body;
  });

  const taskRes = await tasks.run({ silent });
  if (!taskRes.ok) {
    ok = false;
  }

  if (!silent) {
    log.info();
  }

  // Prepare files.
  const paths = await fs.glob.find(`${args.dir}/*`, { dot: false, includeDirs: false });
  const wait = paths.map(async path => {
    const data = await fs.readFile(path);
    const bytes = Uint8Array.from(data).length;

    const filename = fs.basename(path);
    const remoteFile = findRemote(filename);

    const hash = {
      local: Value.hash.sha256(data),
      remote: remoteFile ? remoteFile.props.integrity?.filehash : '',
    };

    let status: t.FileStatus = 'ADDED';
    if (remoteFile) {
      status = hash.local === hash.remote ? 'NO_CHANGE' : 'CHANGED';
    }

    const url = cellUrls.file.byName(filename).toString();
    const isPending = status !== 'NO_CHANGE';
    const item: t.IPayloadFile = { status, isPending, filename, path, url, data, bytes };
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
    log: () => logPayload({ items, force: args.force, delete: args.delete }),
  };
}

/**
 * Logs a set of payload items.
 */
export function logPayload(args: { items: t.IPayloadFile[]; delete: boolean; force: boolean }) {
  const { items } = args;
  let count = 0;
  const table = log.table({ border: false });
  const list = items.filter(item => (item.status === 'DELETED' ? args.delete : true));
  fs.sort
    .objects(list, item => item.filename)
    .forEach(item => {
      const { bytes } = item;
      const filename = util.toStatusColor({
        status: item.status,
        text: item.filename,
        delete: args.delete,
        force: args.force,
      });

      const filePath = log.gray(`${filename}`);

      const statusText = item.status.toLowerCase().replace(/\_/g, ' ');

      const status = util.toStatusColor({
        status: item.status,
        text: statusText,
        delete: args.delete,
        force: args.force,
      });

      const size = bytes > -1 ? fs.size.toString(bytes) : '';

      table.add([`${status}  `, `${filePath}  `, size]);
      count++;
    });

  if (count > 0) {
    log.info(table.toString());
  }
}
