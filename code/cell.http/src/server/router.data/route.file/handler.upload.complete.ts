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

    const beforeFileInfoResponse = await fs.info(fileUri); // temp

    // if (!infoResponse.ok) {
    //   const { status, error } = infoResponse;
    //   const message = error?.message || `Failed to read [${uri}] from file-system.`;
    //   return util.toErrorPayload(message, { status });
    // }
    // const file = infoResponse.file;
    // const exists = Boolean(file?.data);

    // Read in file-data.
    const model = await models.File.create({ db, uri: fileUri }).ready;
    const after = { ...model.props.props };
    // const before = model.props.props;

    console.log('-------------------------------------------');
    console.log('COMPLETE upload');

    const getStatus = (): t.FileIntegrityStatus => {
      // TODO 🐷
      return 'UNKNOWN';
    };

    const status = getStatus();

    after.integrity = {
      ...after.integrity,
      status,
      uploadedAt: status === 'UPLOADING' ? -1 : now,
    };

    

    // Update model integrity object.
    // integrity;
    // after.

    // Update the model with latest data from downloaded file (if required).
    // if (args.overwrite || !after.integrity) {
    //   after.bytes = file ? file.bytes : -1;
    //   after.location = file?.path ? Schema.file.toFileLocation(file.path) : '';
    //   after.integrity = {
    //     ...((after.integrity || {}) as t.IFileIntegrity),
    //     ok: null,
    //     exists,
    //     filehash: file?.hash,
    //     uploadedAt: now,
    //     verifiedAt: now,
    //   };

    // Store S3 specific details.
    if (fs.type === 'S3') {
      const s3 = beforeFileInfoResponse as t.IFsInfoS3;
      if (s3['s3:etag']) {
        after.integrity['s3:etag'] = s3['s3:etag'];
      }
    }

    // Perform verification.
    // const ok = after.integrity?.filehash === (file?.hash || ''); // TODO 🐷 - ensure filehash exists to be OK
    // if (after.integrity) {
    //   const integrity = after.integrity;
    //   const status: t.FileIntegrityStatus = ok ? 'VALID' : exists ? 'INVALID' : 'UPLOADING'; // TODO 🐷 - better
    //   integrity.status = status;
    //   integrity.uploadedAt = integrity.uploadedAt === undefined ? now : integrity.uploadedAt;
    // }

    // Update error.
    // if (!ok) {
    //   model.props.error = {
    //     message: `DANGER the file-hash does not match the underlying data.`,
    //     type: ERROR.HTTP.HASH_MISMATCH,
    //   };
    // }
    // if (ok && model.props.error && model.props.error.type === ERROR.HTTP.HASH_MISMATCH) {
    //   model.props.error = undefined;
    // }

    // Save any changes to the model (DB).
    models.setProps(model, after);

    // console.log('model.isChanged', model.isChanged);

    if (model.isChanged) {
      const res = await model.save();
      if (sendChanges) {
        changes = [...changes, ...models.toChanges(fileUri, res.changes)];
      }
    }

    // TEMP 🐷
    // console.log('model.isChanged', model.isChanged);
    // console.log('-------------------------------------------');
    // console.log('after (verify)', after);
    // console.log('model.toObject()', model.toObject());

    // Finish up.
    const afterFileInfoResponse = await fileInfo({ fileUri, db, host });
    const afterFileInfoData = afterFileInfoResponse.data as t.IResGetFile;
    const res: t.IPayload<t.IResPostFileUploadComplete> = {
      status: afterFileInfoResponse.status,
      data: {
        ...afterFileInfoData,
        changes: sendChanges ? changes : undefined,
      },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
