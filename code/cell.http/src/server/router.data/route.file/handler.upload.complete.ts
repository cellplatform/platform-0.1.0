import { defaultValue, ERROR, models, t, time, util } from '../common';
import { getFileInfoHandler } from './handler.info';

export async function postFileUploadCompleteHandler(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  host: string;
  query?: t.IUrlQueryFileVerified;
  overwrite?: boolean;
}): Promise<t.IPayload<t.IResPostFileVerified> | t.IErrorPayload> {
  const { db, uri, query = {}, fs, host } = args;
  const sendChanges = defaultValue(query.changes, true);
  let changes: t.IDbModelChange[] = [];

  try {
    // Retrieve the file (S3 or local).
    const readResponse = await fs.read(uri);
    if (!readResponse.ok) {
      const { status, error } = readResponse;
      const message = error?.message || `Failed to read [${uri}] from file-system.`;
      return util.toErrorPayload(message, { status });
    }
    const file = readResponse.file;
    const exists = Boolean(file?.data);

    // Read in file-data.
    const model = await models.File.create({ db, uri }).ready;
    const before = model.props.props;
    const after = { ...before };
    const now = time.now.timestamp;

    // Update the model with latest data from downloaded file (if required).
    if (args.overwrite || !after.integrity) {
      after.bytes = file ? file.bytes : -1;
      after.location = file?.path || '';

      after.integrity = {
        ...((after.integrity || {}) as t.IFileIntegrity),
        ok: null,
        exists,
        filehash: file?.hash,
        uploadedAt: now,
        verifiedAt: now,
      };

      // If the response came from S3 then store the "etag".
      if (fs.type === 'S3') {
        const s3Response = readResponse as t.IFileSystemReadS3;
        if (s3Response['S3:ETAG']) {
          after.integrity['S3:ETAG'] = s3Response['S3:ETAG'];
        }
      }
    }

    // Perform verification.
    const ok = after.integrity?.filehash === (file?.hash || ''); // TODO 🐷 - ensure filehash exists to be OK
    if (after.integrity) {
      const integrity = after.integrity;
      const status: t.FileIntegrityStatus = ok ? 'VALID' : exists ? 'INVALID' : 'UPLOADING'; // TODO 🐷 - better
      integrity.ok = ok;
      integrity.status = status;
      integrity.verifiedAt = now;
      integrity.uploadedAt = integrity.uploadedAt === undefined ? now : integrity.uploadedAt;
    }

    // Update error.
    if (!ok) {
      model.props.error = {
        message: `DANGER the file-hash does not match the underlying data.`,
        type: ERROR.HTTP.HASH_MISMATCH,
      };
    }
    if (ok && model.props.error && model.props.error.type === ERROR.HTTP.HASH_MISMATCH) {
      model.props.error = undefined;
    }

    // Save any changes to the model (DB).
    models.setProps(model, after);
    if (model.isChanged) {
      const res = await model.save();
      if (sendChanges) {
        changes = [...changes, ...models.toChanges(uri, res.changes)];
      }
    }

    console.log('-------------------------------------------');
    console.log('after (verify)', after);

    // Finish up.
    const fileResponse = await getFileInfoHandler({ uri, db, query, host });
    const fileResponseData = fileResponse.data as t.IResGetFile;
    const res: t.IPayload<t.IResPostFileVerified> = {
      status: fileResponse.status,
      data: {
        isValid: ok,
        ...fileResponseData,
        changes: sendChanges ? changes : undefined,
      },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
