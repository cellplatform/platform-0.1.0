import { ERROR, t, util } from '../common';
import { getFileInfoResponse } from './file.info';

export const getFileDownloadResponse = async (args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  host: string;
  query?: t.IUrlQueryFileDownload;
}) => {
  const { db, fs, uri, host, query = {} } = args;

  try {
    // Pull the file meta-data.
    const fileResponse = await getFileInfoResponse({ uri, db, query, host });
    if (!util.isOK(fileResponse.status)) {
      return fileResponse; // NB: This is an error.
    }
    const file = fileResponse.data as t.IResGetFile;

    // Match hash if requested.
    if (query.hash && file.data.hash !== query.hash) {
      const err = new Error(`"${file.uri}" hash does not match requested hash.`);
      return util.toErrorPayload(err, { status: 409, type: ERROR.HTTP.HASH_MISMATCH });
    }

    // Ensure the file exists.
    if (!file.exists) {
      const err = new Error(`"${file.uri}" does not exist.`);
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
    }

    // Get the location.
    const props = file.data.props;
    const location = (props.location || '').trim();
    if (!location) {
      const err = new Error(`"${file.uri}" does not have a location.`);
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
    }

    // Redirect if the location is an S3 link.
    if (util.isHttp(location)) {
      return { status: 307, data: location };
    }

    // Serve the file if local file-system.
    if (util.isFile(location) && fs.type === 'FS') {
      const local = await fs.read(uri);
      const data = local.file ? local.file.data : undefined;
      if (!data) {
        const err = new Error(`File at the URI "${file.uri}" does on the local file-system.`);
        return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
      } else {
        return { status: 200, data };
      }
    }

    // Something went wrong if we got this far.
    const err = new Error(`File at the URI "${file.uri}" could not be served.`);
    return util.toErrorPayload(err, { status: 500 });
  } catch (err) {
    return util.toErrorPayload(err);
  }
};
