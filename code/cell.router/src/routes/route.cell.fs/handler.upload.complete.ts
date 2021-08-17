import { defaultValue, models, Schema, t, util } from '../common';
import { postNsResponse } from '../route.ns';
import { getCellFiles, toFileList } from './handler.list';

export async function uploadCellFilesComplete(args: {
  db: t.IDb;
  fs: t.IFilesystem;
  cellUri: string;
  body: t.IReqPostCellFsUploadCompleteBody;
  host: string;
  changes?: boolean;
}) {
  const { db, fs, host } = args;
  const cellUri = Schema.Uri.cell(args.cellUri);
  const cellKey = cellUri.key;
  const sendChanges = defaultValue(args.changes, true);

  // Retrieve models
  const ns = await models.Ns.create({ db, uri: cellUri.ns }).ready;
  const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;

  // Update cell links:
  //  - removing "uploading" status
  //  - adding the new hash of the file-model.
  const cellLinks = { ...(cell.props.links || {}) };
  const filesBefore = (await getCellFiles({ ns, fs, cellLinks })).list;
  const cellLinkFiles = Object.keys(cellLinks)
    .filter((key) => Schema.File.Links.is.fileKey(key))
    .map((key) => ({ key, value: cellLinks[key] }));

  cellLinkFiles
    .filter(({ value }) => Schema.File.Links.is.fileUploading(value))
    .map((item) => {
      const link = Schema.File.Links.parse(item.key, item.value);
      const found = filesBefore.find((item) => item.uri === link.uri.toString());
      const file = found?.data;
      return { ...item, link, file };
    })
    .filter(({ file }) => Boolean(file))
    .forEach(({ key, link, file }) => {
      const hash = file?.hash || null;
      cellLinks[key] = link.toString({ status: null, hash });
    });

  // Save the model.
  // NB: This is done through the master [namespace] POST
  //     handler as this ensures all hashes are updated.
  const nsResponse = await postNsResponse({
    db,
    fs,
    id: ns.props.id,
    body: { cells: { [cellKey]: { links: cellLinks } } },
    query: { cells: cellKey, files: true, changes: sendChanges },
    host,
  });

  const nsResponseData = nsResponse.data as t.IResPostNs;
  if (!util.isOK(nsResponse.status)) {
    const status = nsResponse.status;
    const err = `Failed while completing file(s) upload to [${cellUri}].`;
    util.toErrorPayload(err, { status });
  }

  // Build change list.
  let changes: t.IDbModelChange[] | undefined;
  if (sendChanges) {
    changes = [...(nsResponseData.changes || [])];
  }

  // Build the final list of changed files.
  const filesAfter = nsResponseData.data.files
    ? toFileList({ ns, map: nsResponseData.data.files })
    : [];

  // Prepare response.
  await cell.load({ force: true });
  const res: t.IResPostCellFsUploadComplete = {
    uri: cellUri.toString(),
    createdAt: cell.createdAt,
    modifiedAt: cell.modifiedAt,
    exists: Boolean(cell.exists),
    data: {
      cell: cell.toObject(),
      files: filesAfter,
      changes,
    },
    urls: {},
  };

  // Finish up.
  return { status: 200, data: res };
}
