import { cell, t, util } from '../common';

export async function getCoordHandler<T extends t.IUriResponse<any, any>>(args: {
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

  return { status: 200, data: res as T };
}
