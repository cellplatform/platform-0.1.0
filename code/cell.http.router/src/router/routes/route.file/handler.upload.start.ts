import { defaultValue, models, t, time, Schema, util } from '../common';
import { fileInfo } from './handler.info';

export async function uploadFileStart(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  mimetype: string;
  fileUri: string;
  filename: string;
  filehash?: string;
  sendChanges?: boolean;
  expires?: string; // Parsable duration, eg "1h", "5m" etc. Max: "1h".
}): Promise<t.IPayload<t.IResPostFileUploadStart> | t.IErrorPayload> {
  const { db, fileUri, fs, host, mimetype } = args;
  const sendChanges = defaultValue(args.sendChanges, true);
  let changes: t.IDbModelChange[] = [];

  try {
    const filename = (args.filename || '').trim();
    const filehash = (args.filehash || '').trim();

    if (!filename) {
      const error = `A filename for [${fileUri}] was not specified.`;
      return util.toErrorPayload(error, { status: 400 });
    }

    if (!filehash) {
      const error = `A filehash for [${fileUri}] was not specified.`;
      return util.toErrorPayload(error, { status: 400 });
    }

    // Retrieve the model.
    const model = await models.File.create({ db, uri: fileUri }).ready;

    // Generate the pre-signed POST link.
    const expires = args.expires || '1h';
    const seconds = util.toSeconds(expires) || 3600;
    const contentType = mimetype;
    const presignedPost = fs.resolve(fileUri, { type: 'SIGNED/post', contentType, expires });
    const expiresAt = time
      .day()
      .add(seconds, 's')
      .toDate()
      .getTime();

    const upload: t.IFilePresignedUploadUrl = {
      expiresAt,
      method: 'POST',
      filename,
      uri: fileUri,
      url: fs.type === 'LOCAL' ? Schema.urls(host).local.fs.toString() : presignedPost.path,
      props: presignedPost.props,
    };

    // Update the model.
    const integrity: t.IFileIntegrity = {
      status: 'UPLOADING',
      filehash: filehash || undefined,
    };
    models.setProps(model, { mimetype, integrity });

    // Save the model.
    if (model.isChanged) {
      const saveResponse = await model.save();
      if (sendChanges) {
        changes = [...changes, ...models.toChanges(fileUri, saveResponse.changes)];
      }
    }

    // Finish up.
    const fileResponse = await fileInfo({
      fileUri,
      db,
      host,
    });
    const { status } = fileResponse;
    const fileResponseData = fileResponse.data as t.IResGetFile;
    const res: t.IPayload<t.IResPostFileUploadStart> = {
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
