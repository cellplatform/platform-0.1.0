import { defaultValue, models, t, time, util } from '../common';
import { getFileInfoResponse } from './file.info';

export async function postFileResponse(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  filename: string;
  filehash?: string;
  host: string;
  query?: t.IUrlQueryFileUpload;
  seconds?: number; // Expires.
}): Promise<t.IPayload<t.IResPostFile> | t.IErrorPayload> {
  const { db, uri, query = {}, fs, host } = args;
  const seconds = defaultValue(args.seconds, 10 * 60); // Default: 10 minutes.
  const sendChanges = defaultValue(query.changes, true);
  let changes: t.IDbModelChange[] = [];

  try {
    const filename = (args.filename || '').trim();
    const filehash = (args.filehash || '').trim();
    if (!filename) {
      const error = `A filename for [${uri}] was not specified.`;
      return util.toErrorPayload(error, { status: 400 });
    }

    // Retrieve the model.
    const model = await models.File.create({ db, uri }).ready;

    // Generate the pre-signed POST link.
    const contentType = model.props.props?.mimetype || 'application/octet-stream';
    const presignedPost = fs.resolve(uri, { type: 'SIGNED/post', contentType, seconds });
    const expiresAt = time
      .day()
      .add(seconds, 's')
      .toDate()
      .getTime();

    const upload: t.IFileUploadUrl = {
      filename,
      uri,
      url: presignedPost.path,
      props: presignedPost.props,
      expiresAt,
    };

    // Update the model.
    const integrity: t.IFileIntegrity = {
      ok: null,
      exists: null, // TODO 🐷
      status: 'UNKNOWN', // TODO 🐷
      filehash,
      verifiedAt: -1,
      uploadedAt: -1,
      uploadExpiresAt: upload.expiresAt,
    };
    models.setProps(model, { filename, integrity });

    // Save the model.
    if (model.isChanged) {
      const saveResponse = await model.save();
      if (sendChanges) {
        changes = [...changes, ...models.toChanges(uri, saveResponse.changes)];
      }
    }

    // Finish up.
    const fileResponse = await getFileInfoResponse({ uri, db, query, host });
    const { status } = fileResponse;
    const fileResponseData = fileResponse.data as t.IResGetFile;
    const res: t.IPayload<t.IResPostFile> = {
      status,
      data: {
        ...fileResponseData,
        upload,
        changes: sendChanges ? changes : undefined,
      },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
