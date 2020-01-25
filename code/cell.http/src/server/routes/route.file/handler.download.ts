import { ERROR, t, util } from '../common';
import { fileInfo } from './handler.info';

export const downloadFilePreflight = async (args: {
  host: string;
  db: t.IDb;
  fileUri: string;
  filename?: string;
  matchHash?: string;
}) => {
  try {
    const { db, fileUri, filename, host, matchHash } = args;
    const mime = util.toMimetype(filename) || 'application/octet-stream';

    let error: t.IHttpError | undefined;

    // Pull the file meta-data.
    const fileResponse = await fileInfo({ fileUri, db, host });
    if (!util.isOK(fileResponse.status)) {
      // NB: This is an error.
      error = (fileResponse as unknown) as t.IHttpError;
      return { error };
    }
    const file = fileResponse.data as t.IResGetFile;

    // Match hash if requested.
    if (typeof matchHash === 'string' && file.data.hash !== matchHash) {
      const identifier = filename ? `'${filename}'` : `[${fileUri}]`;
      const message = `The requested hash of ${identifier} does not match the hash of the stored file.`;
      const type = ERROR.HTTP.HASH_MISMATCH;
      error = { status: 409, type, message };
      return { error };
    }

    // Ensure the file exists.
    if (!file.exists) {
      const message = `[${file.uri}] does not exist.`;
      const type = ERROR.HTTP.NOT_FOUND;
      error = { status: 404, type, message };
      return { error };
    }

    // Get the location.
    const props = file.data.props;
    const location = (props.location || '').trim();
    if (!location) {
      const message = `[${file.uri}] does not have a location.`;
      const type = ERROR.HTTP.NOT_FOUND;
      error = { status: 404, type, message };
      return { error };
    }

    // Finish up.
    return { mime, location, file };
  } catch (err) {
    // Fail.
    const message = err.message;
    const type = ERROR.HTTP.SERVER;
    const error = { status: 500, type, message };
    return { error };
  }
};
