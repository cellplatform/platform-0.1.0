import { defaultValue, models, Schema, t, util } from '../common';
import { postFileUploadStartHandler } from '../route.file';
import { postNsResponse } from '../route.ns';

export async function uploadCellFilesStartHandler(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  body: t.IReqPostCellUploadFilesBody;
  host: string;
  changes?: boolean;
}) {
  const { db, fs, cellUri, body, host } = args;
  const parts = Schema.uri.parse<t.ICellUri>(cellUri).parts;
  const cellKey = parts.key;
  const ns = parts.ns;

  const seconds = body.seconds;
  const files = body.files || [];
  if (files.length === 0) {
    const err = new Error(`No file(s) info was posted in the body for [${cellUri}]`);
    return util.toErrorPayload(err, { status: 400 });
  }

  const postFileModel = async (args: {
    ns: string;
    file: t.IReqPostCellUploadFile;
    links: t.IUriMap;
  }) => {
    const { ns, file, links = {} } = args;
    const { filename, filehash } = file;
    const key = Schema.file.links.toKey(filename);
    const uri = links[key] ? links[key].split('?')[0] : Schema.uri.create.file(ns, Schema.slug());
    const query = { changes: true };
    const res = await postFileUploadStartHandler({
      host,
      db,
      fs,
      uri,
      filename,
      filehash,
      query,
      seconds,
    });
    const json = res.data as t.IResPostFile;
    const status = res.status;
    return { status, res, key, uri, filename, json };
  };

  // Prepare the file URI link.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;
  const cellLinks = cell.props.links || {};

  // Post each file to the file-system as a model getting it's signed upload-link.
  const wait = files.map(file => postFileModel({ ns, file, links: cellLinks }));
  const postFilesRes = await Promise.all(wait);

  // Check for file-save errors.
  const errors: t.IResPostCellFilesError[] = [];
  postFilesRes
    .filter(item => !util.isOK(item.status))
    .forEach(item => {
      const { status, filename } = item;
      const data: any = item.res.data || {};
      const message = data.message || `Failed while writing '${filename}'`;
      errors.push({ status, filename, message });
    });

  // Update the [Cell] model with the file URI link(s).
  // NB: This is done through the master [Namespace] POST
  //     handler as this ensures all hashes are updated.
  const links = postFilesRes.reduce((links, next) => {
    if (util.isOK(next.status)) {
      const { key, uri } = next;
      links[key] = `${uri}?hash=${next.json.data.hash}`;
    }
    return links;
  }, cellLinks);

  const postNsRes = await postNsResponse({
    db,
    id: ns,
    body: { cells: { [cellKey]: { links } } },
    query: { cells: cellKey, changes: true },
    host,
  });

  if (!util.isOK(postNsRes.status)) {
    const error = postNsRes.data as t.IHttpError;
    const msg = `Failed while updating cell [${cellKey}] after writing file. ${error.message}`;
    return util.toErrorPayload(msg, { status: error.status });
  }
  const postNsData = postNsRes.data as t.IResPostNs;

  // Build change list.
  let changes: t.IDbModelChange[] | undefined;
  if (defaultValue(args.changes, true)) {
    changes = [...(postNsData.changes || [])];
    postFilesRes.forEach(item => {
      changes = [...(changes || []), ...(item.json.changes || [])];
    });
  }

  // Prepare response URLs.
  const urls = {
    ...util.urls(host).cell(cellUri).urls,
    uploads: postFilesRes.map(item => item.json.upload).filter(item => Boolean(item)),
  };

  // Prepare response.
  await cell.load({ force: true });
  const res: t.IResPostCellFiles = {
    uri: cellUri,
    createdAt: cell.createdAt,
    modifiedAt: cell.modifiedAt,
    exists: Boolean(cell.exists),
    data: { cell: cell.toObject(), errors, changes },
    urls,
  };

  // Finish up.
  return { status: 200, data: res };
}
