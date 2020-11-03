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
    const fsFileInfo = await fs.info(fileUri);

    // Read in file-data.
    const model = await models.File.create({ db, uri: fileUri }).ready;
    const after: t.IFileProps = { ...model.props.props };
    if (fsFileInfo.exists) {
      const { location, bytes } = fsFileInfo;
      after.location = location;
      after.bytes = bytes;
    }

    const getStatus = (): t.FileIntegrityStatus => {
      const { exists } = fsFileInfo;
      if (!exists) {
        return 'INVALID/fileMissing';
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

    let error: t.IFileError | undefined;
    if (!ok) {
      error = {
        type: 'FILE/upload',
        message: `File status after attempting to upload: ${status}`,
        filename: fileUri,
      };
    }

    // Store S3 specific details.
    if (fs.type === 'S3') {
      const s3 = fsFileInfo as t.IFsInfoS3;
      if (s3['s3:etag']) {
        after['s3:etag'] = s3['s3:etag'];
        after['s3:permission'] = s3['s3:permission'];
      }
    }

    // Clear any invalid errors if the model is OK.
    if (ok && model.props.error?.type.startsWith('INVALID')) {
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
    const fileInfoAfterData = fileInfoAfter.data as t.IResGetFile;
    const res: t.IPayload<t.IResPostFileUploadComplete> = {
      status: error ? 500 : fileInfoAfter.status,
      data: {
        ...{ ...fileInfoAfterData, data: { ...fileInfoAfterData.data, error } },
        changes: sendChanges ? changes : undefined,
      },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
