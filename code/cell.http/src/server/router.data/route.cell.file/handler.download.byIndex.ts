import { models, t, util } from '../common';
import { downloadFile } from '../route.file';

export async function downloadFileByIndex(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  index: number;
  host: string;
  matchHash?: string;
}) {
  const { db, fs, cellUri, index, matchHash, host } = args;

  // Retreive the [cell] info.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;
  const cellLinks = cell.props.links || {};
  const fileUri = cellLinks[Object.keys(cellLinks)[index]];

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `A file at index [${index}] does not exist within the cell "${cellUri}".`;
    return util.toErrorPayload(err, { status: 404 });
  }

  // Run the "file:" download handler.
  return downloadFile({ db, fs, fileUri, matchHash, host });
}
