import { models, t, util } from '../common';

export async function deleteFile(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  fileUri: string;
  host: string;
}): Promise<t.IPayload<t.IResDeleteFile> | t.IErrorPayload> {
  const { db, fs, fileUri } = args;

  try {
    // Delete the file from disk.
    const resDeleteFile = await fs.delete(fileUri);
    const fsError = resDeleteFile.error;
    if (fsError) {
      const { type } = fsError;
      return util.toErrorPayload(fsError.message, { type });
    }

    // Delete the model.
    const model = await models.File.create({ db, uri: fileUri }).ready;
    await model.delete();

    const res: t.IPayload<t.IResDeleteFile> = {
      status: 200,
      data: { deleted: true, uri: fileUri },
    };
    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
