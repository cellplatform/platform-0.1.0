import { Schema, t, util, ERROR } from '../common';
import { downloadBinaryFile, downloadTextFile } from '../route.file';
import { rewritePaths } from './util.rewritePaths';

export async function downloadFileByFileId(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  filename: string;
  matchHash?: string;
  expires?: string;
}) {
  const { db, fs, cellUri, filename = '', matchHash, host, expires } = args;
  const mime = util.toMimetype(filename) || 'application/octet-stream';

  // Extract the file-index (if present).
  const extIndex = filename.lastIndexOf('.');
  const fileid = extIndex < 0 ? filename : filename.substring(0, extIndex);

  // Construct the [FileUri].
  const ns = Schema.uri.parse<t.ICellUri>(cellUri).parts.ns;
  const fileUri = Schema.uri.create.file(ns, fileid);

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `The file '${filename}' is not linked to the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_LINKED });
  }

  const downloadHtmlAndRewritePaths = async () => {
    const res = await downloadTextFile({ host, db, fs, fileUri, filename, matchHash, mime });
    if (typeof res.data === 'string') {
      const html = res.data;
      return { ...res, data: await rewritePaths({ host, db, cellUri, html, filename }) };
    } else {
      return res;
    }
  };

  // Run the appropriate download handler.
  if (mime === 'text/html') {
    return downloadHtmlAndRewritePaths();
  } else {
    return downloadBinaryFile({ host, db, fs, fileUri, filename, matchHash, expires });
  }
}
