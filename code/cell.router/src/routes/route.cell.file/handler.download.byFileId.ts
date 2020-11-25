import { ERROR, Schema, t, util } from '../common';
import { downloadBinaryFile, downloadTextFile } from '../route.file';
import { rewriteHtmlPaths } from './util.rewritePaths';

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
  const ns = Schema.uri.cell(cellUri).ns;
  const fileUri = Schema.uri.create.file(ns, fileid);

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `The file '${filename}' is not linked to the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_LINKED });
  }

  const downloadAndRewritePaths = async (args: { mime: string }) => {
    const res = await downloadTextFile({ host, db, fs, fileUri, filename, matchHash, mime });
    if (typeof res.data !== 'string') {
      return res;
    }
    if (args.mime === 'text/html') {
      const html = res.data;
      return { ...res, data: await rewriteHtmlPaths({ host, db, cellUri, html, filename }) };
    } else {
      return res;
    }
  };

  // Run the appropriate download handler.

  if (mime === 'text/html') {
    // NOTE: Html files are downloaded and served directly
    //       so that any interal relative links (from src/href of dynamic
    //       loading of module) keep the CellOS host as their origin
    //       and avoid being shut-out by S3 security.
    return downloadAndRewritePaths({ mime });
  } else {
    return downloadBinaryFile({ host, db, fs, fileUri, filename, matchHash, expires });
  }
}
