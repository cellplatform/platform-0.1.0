import { ERROR, t, util } from '../common';
import { fileInfo } from './handler.info';

export const downloadFile = async (args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  fileUri: string;
  matchHash?: string;
  seconds?: number;
}) => {
  const { db, fs, fileUri, host, matchHash, seconds } = args;

  try {
    // Pull the file meta-data.
    const fileResponse = await fileInfo({ fileUri, db, host });
    if (!util.isOK(fileResponse.status)) {
      return fileResponse; // NB: This is an error.
    }
    const file = fileResponse.data as t.IResGetFile;

    // Match hash if requested.
    if (typeof matchHash === 'string' && file.data.hash !== matchHash) {
      const filename = file.data.props.filename;
      const err = `The requested hash of '${filename}' does not match the hash of the stored file.`;
      return util.toErrorPayload(err, { status: 409, type: ERROR.HTTP.HASH_MISMATCH });
    }

    // Ensure the file exists.
    if (!file.exists) {
      const err = new Error(`[${file.uri}] does not exist.`);
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
    }

    // Get the location.
    const props = file.data.props;
    const location = (props.location || '').trim();
    if (!location) {
      const err = new Error(`[${file.uri}] does not have a location.`);
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
    }

    // Redirect if the location is an S3 link.
    if (fs.type === 'S3') {
      const data = fs.resolve(fileUri, { type: 'SIGNED/get', seconds }).path;
      return { status: 307, data };
    }

    // Serve the file if LOCAL file-system.
    if (util.isFile(location) && fs.type === 'LOCAL') {
      const local = await fs.read(fileUri);
      const data = local.file ? local.file.data : undefined;
      if (!data) {
        const err = new Error(`File at the URI [${file.uri}] does on the local file-system.`);
        return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
      } else {
        return { status: 200, data };
      }
    }

    // Something went wrong if we got this far.
    const err = new Error(`[${file.uri}] could not be served.`);
    return util.toErrorPayload(err, { status: 500 });
  } catch (err) {
    return util.toErrorPayload(err);
  }
};
