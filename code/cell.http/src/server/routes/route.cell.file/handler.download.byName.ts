import { Schema, t, util } from '../common';
import { downloadBinaryFile, downloadTextFile } from '../route.file';
import { rewritePaths } from './util.rewritePaths';

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
  const mime = util.toMimetype(filename) || 'application/octet-stream';

  const fileid = filename.split('.')[0] || '';
  const ns = Schema.uri.parse<t.ICellUri>(cellUri).parts.ns;
  const fileUri = Schema.uri.create.file(ns, fileid);

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `The file '${filename}' is not linked to the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404 });
  }

  const downloadHtmlAndRewritePaths = async () => {
    const res = await downloadTextFile({ host, db, fs, fileUri, filename, matchHash, mime });
    if (typeof res.data === 'string') {
      const html = res.data;
      return { ...res, data: await rewritePaths({ host, db, cellUri, html }) };
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
