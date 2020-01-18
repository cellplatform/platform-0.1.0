import { cli, fs, log, Schema } from '../common';
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
  const findRemote = (path: string) => remoteFiles.find(f => f.path === path);

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
  const paths = await fs.glob.find(`${args.dir}/**`, { dot: false, includeDirs: false });

  const wait = paths.map(async localPath => {
    const data = await fs.readFile(localPath);
    const bytes = Uint8Array.from(data).length;
    const localHash = Schema.hash.sha256(data);

    const filename = fs.basename(localPath);
    const dir = localPath
      .substring(args.dir.length, localPath.length - filename.length)
      .replace(/^\/*/, '')
      .replace(/\/*$/, '')
      .trim();

    const path = fs.join(dir, filename);

    const remoteFile = findRemote(path);
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
      localPath,
      path,
      dir,
      filename,
      filehash: localHash,
      url,
      data,
      bytes,
    };
    return item;
  });
  const files = await Promise.all(wait);

  // Add list of deleted files (on remote, but not local).
  const isDeleted = (path?: string) => !files.some(item => item.path === path);
  remoteFiles
    .filter(file => Boolean(file.path))
    .filter(file => isDeleted(file.path))
    .forEach(file => {
      const { filename, dir, path: localPath } = file;
      const path = fs.join(dir, filename);
      const url = cellUrls.file.byName(path).toString();
      const isPending = args.delete;
      const filehash = file.props.integrity?.filehash || '';
      files.push({
        status: 'DELETED',
        isPending,
        localPath,
        path,
        dir,
        filename,
        filehash,
        url,
        bytes: -1,
      });
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

      const path = util.toStatusColor({
        status: item.status,
        text: item.path,
        delete: args.delete,
        force: args.force,
      });
      const file = log.gray(`${path}`);

      const statusText = item.status.toLowerCase().replace(/\_/g, ' ');

      const status = util.toStatusColor({
        status: item.status,
        text: statusText,
        delete: args.delete,
        force: args.force,
      });

      const size = bytes > -1 ? fs.size.toString(bytes) : '';

      table.add([`${status}  `, `${file}  `, size]);
      count++;
    });

  return count > 0 ? table.toString() : '';
}
