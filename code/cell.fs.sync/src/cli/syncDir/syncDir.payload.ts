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
  const findRemote = (filehash: string) =>
    remoteFiles.find(f => f.props.integrity?.filehash === filehash);

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
    const localHash = Schema.hash.sha256(data);

    const filename = fs.basename(path);
    const remoteFile = findRemote(localHash);
    const remoteHash = remoteFile ? remoteFile.props.integrity?.filehash : '';

    let status: t.FileStatus = 'ADDED';
    if (remoteFile) {
      status = localHash === remoteHash ? 'NO_CHANGE' : 'CHANGED';
    }

    const url = cellUrls.file.byName(filename).toString();
    const isPending = status !== 'NO_CHANGE';
    const item: t.IPayloadFile = {
      status,
      isPending,
      filename,
      filehash: localHash,
      path,
      url,
      data,
      bytes,
    };
    return item;
  });
  const files = await Promise.all(wait);

  // Add list of deleted files (on remote, but not local).
  const isDeleted = (filename?: string) => !files.some(item => item.filename === filename);
  remoteFiles
    .filter(file => Boolean(file.filename))
    .filter(file => isDeleted(file.filename))
    .forEach(file => {
      const filename = file.filename || '';
      const path = '';
      const url = cellUrls.file.byName(filename).toString();
      const isPending = args.delete;
      const filehash = file.props.integrity?.filehash || '';
      files.push({ status: 'DELETED', isPending, filename, filehash, path, url, bytes: -1 });
    });

  // Finish up.
  const payload: t.IPayload = {
    ok,
    files,
    log: () => logPayload({ files, force: args.force, delete: args.delete }),
  };
  return payload;
}

/**
 * Logs a set of payload items.
 */
export function logPayload(args: { files: t.IPayloadFile[]; delete: boolean; force: boolean }) {
  const { files } = args;
  let count = 0;
  const table = log.table({ border: false });
  const list = files.filter(item => (item.status === 'DELETED' ? args.delete : true));
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

  return count > 0 ? table.toString() : '';
}
