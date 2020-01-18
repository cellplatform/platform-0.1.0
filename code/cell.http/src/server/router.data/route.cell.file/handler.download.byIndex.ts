import { models, t, util, Schema } from '../common';
import { downloadFile } from '../route.file';

export async function downloadFileByIndex(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  index: number;
  matchHash?: string;
  seconds?: number;
}) {
  const { host, db, fs, cellUri, index, matchHash, seconds } = args;

  // Retreive the [cell] info.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;
  const cellLinks = cell.props.links || {};
  const cellLinkKey = Object.keys(cellLinks)[index];
  const cellLink = cellLinks[cellLinkKey];

  // 404 if file URI not found.
  if (!cellLink) {
    const err = `A file at index [${index}] does not exist within the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404 });
  }

  const fileUri = Schema.file.links.parseLink(cellLink).uri;
  const filename = Schema.file.links.parseKey(cellLinkKey).path;

  // Run the "file:" download handler.
  return downloadFile({ host, db, fs, fileUri, filename, matchHash, seconds });
}
