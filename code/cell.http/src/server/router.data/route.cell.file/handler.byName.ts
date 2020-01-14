import { models, Schema, t, util } from '../common';
import { downloadFile } from '../route.file';

export async function fileByName(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  filename: string;
  host: string;
  query?: t.IUrlQueryCellFileByName;
}) {
  const { db, fs, cellUri, filename, query, host } = args;

  // Retreive the [cell] info.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;
  const cellLinks = cell.props.links || {};
  const linkKey = Schema.file.links.toKey(filename);
  const fileUri = cellLinks[linkKey];

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `The file '${filename}' is not associated with the cell "${cellUri}".`;
    return util.toErrorPayload(err, { status: 404 });
  }

  // Run the "file:" download handler.
  return downloadFile({ db, fs, uri: fileUri, query, host });
}
