import { ERROR, t, util } from '../common';
import { downloadFilePreflight } from './handler.download.preflight';

export const downloadBinaryFile = async (args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  fileUri: string;
  filename?: string;
  matchHash?: string;
  expires?: string;
}) => {
  const { host, db, fs, fileUri, filename, matchHash, expires } = args;

  try {
    // Perform preliminary argument checks.
    const preflight = await downloadFilePreflight({ host, db, fileUri, filename, matchHash });

    const { error, file, location, mime = 'application/octet-stream' } = preflight;
    if (error) {
      const { status, message, type } = error;
      return util.toErrorPayload(message, { status, type });
    }
    if (!file || !location) {
      const err = `Failed to retrieve file '${filename}' (${fileUri})`;
      const type = ERROR.HTTP.NOT_FOUND;
      return util.toErrorPayload(err, { status: 404, type });
    }

    // Redirect if the location is an S3 link.
    if (fs.type === 'S3') {
      const data = fs.resolve(fileUri, { type: 'SIGNED/get', expires }).path;
      return { status: 307, data };
    }

    // Serve the file if LOCAL file-system.
    if (fs.type === 'LOCAL' && util.isFile(location)) {
      const local = await fs.read(fileUri);
      const data = local.file ? local.file.data : undefined;
      if (!data) {
        const err = new Error(`File at the URI [${file.uri}] does on the local file-system.`);
        return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
      } else {
        const headers = { 'content-type': mime };
        return { status: 200, data, headers };
      }
    }

    // Something went wrong if we got this far.
    const err = `[${file.uri}] could not be served.`;
    return util.toErrorPayload(err, { status: 500 });
  } catch (err) {
    return util.toErrorPayload(err);
  }
};
