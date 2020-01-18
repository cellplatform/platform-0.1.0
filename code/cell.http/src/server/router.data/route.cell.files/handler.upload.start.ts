import { defaultValue, models, Schema, t, util } from '../common';
import { uploadFileStart } from '../route.file';
import { postNsResponse } from '../route.ns';

export async function uploadCellFilesStart(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  body: t.IReqPostCellFilesUploadStartBody;
  host: string;
  changes?: boolean;
}) {
  const { db, fs, cellUri, body, host } = args;
  const cellUriParts = Schema.uri.parse<t.ICellUri>(cellUri).parts;
  const cellKey = cellUriParts.key;
  const ns = cellUriParts.ns;
  const sendChanges = defaultValue(args.changes, true);

  const seconds = body.seconds;
  const fileDefs = body.files || [];
  if (fileDefs.length === 0) {
    const err = new Error(`No file details posted in the body for [${cellUri}]`);
    return util.toErrorPayload(err, { status: 400 });
  }

  const startUpload = async (args: {
    ns: string;
    file: t.IReqPostCellUploadFile;
    links: t.IUriMap;
  }) => {
    const { ns, file, links = {} } = args;
    const { filename, filehash } = file;
    const mimetype = file.mimetype || util.toMimetype(filename) || 'application/octet-stream';

    const key = Schema.file.links.toKey(filename);
    const fileUri = links[key]
      ? links[key].split('?')[0]
      : Schema.uri.create.file(ns, Schema.slug());

    const res = await uploadFileStart({
      host,
      db,
      fs,
      mimetype,
      fileUri,
      filename,
      filehash,
      seconds,
      sendChanges: true,
    });
    const json = res.data as t.IResPostFileUploadStart;
    const status = res.status;
    return { status, res, key, uri: fileUri, filename, json };
  };

  // Prepare the file URI link.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;
  const cellLinks = cell.props.links || {};

  // POST each file to the file-system creating the model
  //      and retrieving it's signed upload-link.
  const wait = fileDefs.map(file => startUpload({ ns, file, links: cellLinks }));
  const uploadStartResponses = await Promise.all(wait);

  // Check for errors.
  const errors: t.IFileUploadError[] = [];
  uploadStartResponses
    .filter(item => !util.isOK(item.status))
    .forEach(item => {
      const { status, filename } = item;
      const data: any = item.res.data || {};
      const message = data.message || `Failed while starting upload of '${filename}' (${status})`;
      errors.push({ type: 'FILE/upload', filename, message });
    });

  // Update the [Cell] model with the file URI link(s).
  // NB: This is done through the master [Namespace] POST
  //     handler as this ensures all hashes are updated.
  const links = uploadStartResponses.reduce((links, next) => {
    if (util.isOK(next.status)) {
      const { key, uri } = next;
      links[key] = `${uri}?status=uploading`;
    }
    return links;
  }, cellLinks);

  const postNsRes = await postNsResponse({
    db,
    id: ns,
    body: { cells: { [cellKey]: { links } } },
    query: { cells: cellKey, changes: sendChanges },
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
  if (sendChanges) {
    changes = [...(postNsData.changes || [])];
    uploadStartResponses.forEach(item => {
      changes = [...(changes || []), ...(item.json.changes || [])];
    });
  }

  // Prepare response URLs.
  const urls = {
    ...util.urls(host).cell(cellUri).urls,
    uploads: uploadStartResponses.map(item => item.json.upload).filter(item => Boolean(item)),
  };

  // Prepare response files.
  const files: Array<t.IUriData<t.IFileData>> = uploadStartResponses.map(res => {
    return {
      uri: res.uri,
      data: { ...res.json.data },
    };
  });

  // Prepare response.
  await cell.load({ force: true });
  const res: t.IResPostCellFilesUploadStart = {
    uri: cellUri,
    createdAt: cell.createdAt,
    modifiedAt: cell.modifiedAt,
    exists: Boolean(cell.exists),
    data: {
      cell: cell.toObject(),
      files,
      errors,
      changes,
    },
    urls,
  };

  // Finish up.
  return { status: 200, data: res };
}
