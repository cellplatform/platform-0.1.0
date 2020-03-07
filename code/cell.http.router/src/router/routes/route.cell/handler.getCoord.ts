import { cell, t } from '../common';

export async function getCoord<T extends t.IUriResponse<any, any>>(args: {
  uri: string;
  getModel: t.GetModel;
  getUrls: t.GetUrls;
}) {
  const { uri } = args;
  const model = await args.getModel();
  const exists = Boolean(model.exists);
  const { createdAt, modifiedAt } = model;

  const data = cell.value.squash.object(model.toObject()) || {};
  const urls = args.getUrls();

  const res = {
    uri,
    exists,
    createdAt,
    modifiedAt,
    data,
    urls,
  };

  const status = exists ? 200 : 404;
  return { status, data: res as T };
}
