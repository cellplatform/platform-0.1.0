import { ERROR, models, Schema, t, util } from '../common';
import { downloadFileByFileId } from './handler.download.byFileId';

export async function downloadFileByName(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  filename: string;
  matchHash?: string;
  expires?: string;
}) {
  const { db, fs, cellUri, host, expires } = args;

  // Retrieve DB model.
  const cell = await models.Cell.create({ db, uri: cellUri }).ready;

  // Lookup the requested file as a link.
  const link = Schema.file.links.find(cell.props.links).byName(args.filename);
  if (!link) {
    const err = `The file '${args.filename}' is not linked to the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_LINKED });
  }

  // Construct the underlying FS filename.
  const id = link.uri.file;
  const ext = link.ext;
  const filename = ext ? `${id}.${ext}` : id;
  const matchHash = args.matchHash || link.hash;

  // Finish up.
  return downloadFileByFileId({ host, db, fs, cellUri, filename, matchHash, expires });
}
