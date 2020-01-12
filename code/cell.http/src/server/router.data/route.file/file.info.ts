import { models, t, util } from '../common';

export async function getFileInfoResponse(args: {
  db: t.IDb;
  uri: string;
  host: string;
  query?: t.IUrlQueryFileInfo;
}): Promise<t.IPayload<t.IResGetFile> | t.IErrorPayload> {
  const { db, uri, query = {}, host } = args;
  try {
    const model = await models.File.create({ db, uri }).ready;
    const exists = Boolean(model.exists);
    const { createdAt, modifiedAt } = model;
    const data = util.squash.object(model.toObject()) || {};
    const res = {
      uri,
      exists,
      createdAt,
      modifiedAt,
      data,
      urls: util.urls(host).file(uri),
    };
    return { status: 200, data: res as t.IResGetFile };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
