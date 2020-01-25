import { cli, Client, defaultValue, fs, log, Schema, t } from '../common';
import * as util from '../util';

export const getPayload: t.FsSyncGetPayload = async (args: t.IFsSyncGetPayloadArgs) => {
  const { config, silent = false, force = false } = args;
  const dir = config.dir;
  const targetUri = config.target.uri;
  const host = config.data.host;
  const client = Client.create(host);
  const urls = Schema.urls(host);
  return buildPayload({
    dir,
    urls,
    targetUri,
    client,
    force,
    delete: defaultValue(args.delete, true),
    silent,
  });
};

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
  const ns = args.targetUri.parts.ns;
  const cellUrls = args.urls.cell(cellUri);

  // Retrieve the list of remote files.
  let remoteFiles: t.IClientFileData[] = [];
  const findRemote = (path: string) => remoteFiles.find(f => f.path === path);

  const urls = Schema.urls(client.origin);
  const filesUrl = urls.cell(cellUri).files.list;

  const tasks = cli.tasks();
  const title = log.gray(`read cell:${log.magenta(ns)}!${log.blue(cellKey)} on ${filesUrl.origin}`);

  tasks.task(title, async () => {
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
  const paths = await fs.glob.find(`${args.dir}/**`, {
    dot: false,
    includeDirs: false,
    ignore: ['**/node_modules/**'],
  });

  const wait = paths.map(async localPath => {
    const data = await fs.readFile(localPath);
    const localBytes = Uint8Array.from(data).length;
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

    let status: t.FsSyncFileStatus = 'ADDED';
    let remoteBytes = -1;
    if (remoteFile) {
      status = localHash === remoteHash ? 'NO_CHANGE' : 'CHANGED';
      remoteBytes = defaultValue(remoteFile.props.bytes, -1);
    }

    const uri = '';
    const url = cellUrls.file.byName(filename).toString();
    const isPending = status !== 'NO_CHANGE';
    const item: t.IFsSyncPayloadFile = {
      status,
      isPending,
      localPath,
      path,
      dir,
      filename,
      filehash: localHash,
      uri,
      url,
      data,
      localBytes,
      remoteBytes,
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
      const { filename, dir, uri } = file;
      const path = fs.join(dir, filename);
      const url = cellUrls.file.byName(path).toString();
      const isPending = args.delete;
      const filehash = file.props.integrity?.filehash || '';
      const remoteBytes = defaultValue(file.props.bytes, -1);
      files.push({
        status: 'DELETED',
        isPending,
        localPath: fs.join(args.dir, path),
        path,
        dir,
        filename,
        filehash,
        uri,
        url,
        localBytes: -1,
        remoteBytes,
      });
    });

  // Finish up.
  const payload: t.IFsSyncPayload = {
    ok,
    files,
    log: () => logPayload({ files, force: args.force, delete: args.delete }),
  };
  return payload;
}

/**
 * Logs a set of payload items.
 */
export function logPayload(args: {
  files: t.IFsSyncPayloadFile[];
  delete: boolean;
  force: boolean;
}) {
  const { files } = args;
  let count = 0;
  const table = log.table({ border: false });
  const list = files.filter(item => (item.status === 'DELETED' ? args.delete : true));
  fs.sort
    .objects(list, item => item.filename)
    .forEach(item => {
      const { localBytes: bytes } = item;

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
