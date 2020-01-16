import { defaultValue, models, t, time, util } from '../common';
import { fileInfo } from './handler.info';

export async function uploadFileComplete(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  fileUri: string;
  host: string;
  sendChanges?: boolean;
}): Promise<t.IPayload<t.IResPostFileUploadComplete> | t.IErrorPayload> {
  const { db, fileUri, fs, host } = args;
  const sendChanges = defaultValue(args.sendChanges, true);
  const now = time.now.timestamp;
  let changes: t.IDbModelChange[] = [];

  try {
    // Retrieve the file (S3 or local).
    const fsFileInfo = await fs.info(fileUri); // temp

    // Read in file-data.
    const model = await models.File.create({ db, uri: fileUri }).ready;
    const after = { ...model.props.props };
    if (fsFileInfo.exists) {
      const { location, bytes } = fsFileInfo;
      after.location = location;
      after.bytes = bytes;
    }

    const getStatus = (): t.FileIntegrityStatus => {
      const { exists } = fsFileInfo;
      if (!exists) {
        return 'INVALID/fileMissing'; // TODO 🐷 - write error for missing file.
      }
      return 'VALID';
    };

    const status = getStatus();
    const ok = !status.startsWith('INVALID');
    after.integrity = {
      ...after.integrity,
      status,
      uploadedAt: status === 'UPLOADING' ? -1 : now,
    };

    // Store S3 specific details.
    if (fs.type === 'S3') {
      const s3 = fsFileInfo as t.IFsInfoS3;
      if (s3['s3:etag']) {
        after.integrity['s3:etag'] = s3['s3:etag'];
      }
    }

    // TODO 🐷 Perform verification (on different rount)

    // Update error.
    // if (!ok) {
    //   model.props.error = {
    //     message: `DANGER the file-hash does not match the underlying data.`,
    //     type: ERROR.HTTP.HASH_MISMATCH,
    //   };
    // }

    // Clear any invalid errors if the model is OK.
    if (ok && model.props.error && model.props.error.type.startsWith('INVALID')) {
      model.props.error = undefined;
    }

    // Save any changes to the model (DB).
    models.setProps(model, after);
    if (model.isChanged) {
      const res = await model.save();
      if (sendChanges) {
        changes = [...changes, ...models.toChanges(fileUri, res.changes)];
      }
    }

    // Finish up.
    const fileInfoAfter = await fileInfo({ fileUri, db, host });
    const res: t.IPayload<t.IResPostFileUploadComplete> = {
      status: fileInfoAfter.status,
      data: {
        ...(fileInfoAfter.data as t.IResGetFile),
        changes: sendChanges ? changes : undefined,
      },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
