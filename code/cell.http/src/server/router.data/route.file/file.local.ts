import { t, util } from '../common';

export async function fileUploadLocalResponse(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  path: string;
  data: string | Buffer;
  query?: t.IUrlQueryLocalFs;
}): Promise<t.IPayload<t.IResPostFileUploadLocal> | t.IErrorPayload> {
  const { fs, data } = args;

  if (fs.type !== 'LOCAL') {
    const err = `Local routes can only be invoked when running on [localhost].`;
    return util.toErrorPayload(err, { status: 405 });
  }

  try {
    // Read in the file data.
    if (data.length === 0) {
      const err = `No file data provided.`;
      return util.toErrorPayload(err, { status: 400 });
    }

    // Read in the path.
    let path = args.path;
    if (!path) {
      const err = `No file [path] passed in headers.`;
      return util.toErrorPayload(err, { status: 400 });
    }

    // Prepare the path.
    path = path.replace(new RegExp(`^${fs.root}/`), '');
    path = `${fs.root}/${path}`;

    // Save the file.
    await util.fs.ensureDir(util.fs.dirname(path));
    await util.fs.writeFile(path, data);

    // Finish up.
    const res: t.IPayload<t.IResPostFileUploadLocal> = {
      status: 200,
      data: { path },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
