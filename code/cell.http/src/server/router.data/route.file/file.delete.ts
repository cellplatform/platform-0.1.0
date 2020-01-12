import { models, t, util } from '../common';

export async function deleteFileHandler(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  host: string;
  query?: t.IUrlQueryFileDelete;
}): Promise<t.IPayload<t.IResDeleteFile> | t.IErrorPayload> {
  const { db, fs, uri } = args;

  try {
    // Delete the file from disk.
    const resDeleteFile = await fs.delete(uri);
    const fsError = resDeleteFile.error;
    if (fsError) {
      const { type } = fsError;
      return util.toErrorPayload(fsError.message, { type });
    }

    // Delete the model.
    const model = await models.File.create({ db, uri }).ready;
    await model.delete();

    const res: t.IPayload<t.IResDeleteFile> = {
      status: 200,
      data: { deleted: true, uri },
    };
    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
