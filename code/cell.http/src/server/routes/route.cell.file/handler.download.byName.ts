import { Schema, t, util } from '../common';
import { downloadFile } from '../route.file';

export async function downloadFileByName(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  filename: string;
  matchHash?: string;
  expires?: string;
}) {
  const { db, fs, cellUri, filename, matchHash, host, expires } = args;

  const fileid = filename.split('.')[0] || '';
  const ns = Schema.uri.parse<t.ICellUri>(cellUri).parts.ns;
  const fileUri = Schema.uri.create.file(ns, fileid);

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `The file '${filename}' is not associated with the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404 });
  }

  // Run the "file:" download handler.
  return downloadFile({ host, db, fs, fileUri, filename, matchHash, expires });
}
