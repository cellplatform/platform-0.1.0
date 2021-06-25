import { models, t, util } from '../common';
import { getCoord } from './handler.getCoord';

/**
 * Cell
 */
export async function cellInfo(args: {
  host: string;
  db: t.IDb;
  uri: string;
}): Promise<t.IPayload<t.IResGetCell> | t.IErrorPayload> {
  const { host, db, uri } = args;
  const getModel: t.GetModel = () => models.Cell.create({ db, uri }).ready;
  const getUrls: t.GetUrls = () => util.urls(host).cell(uri).urls;
  return get<t.IResGetCell>({ uri, getModel, getUrls });
}

/**
 * Column
 */
export async function rowInfo(args: {
  host: string;
  db: t.IDb;
  uri: string;
}): Promise<t.IPayload<t.IResGetRow> | t.IErrorPayload> {
  const { host, db, uri } = args;
  const getModel: t.GetModel = () => models.Row.create({ db, uri }).ready;
  const getUrls: t.GetUrls = () => util.urls(host).rowUrls(uri);
  return get<t.IResGetRow>({ uri, getModel, getUrls });
}

/**
 * Row
 */
export async function columnInfo(args: {
  host: string;
  db: t.IDb;
  uri: string;
}): Promise<t.IPayload<t.IResGetColumn> | t.IErrorPayload> {
  const { host, db, uri } = args;
  const getModel: t.GetModel = () => models.Column.create({ db, uri }).ready;
  const getUrls: t.GetUrls = () => util.urls(host).columnUrls(uri);
  return get<t.IResGetColumn>({ uri, getModel, getUrls });
}

/**
 * [Helpers]
 */

export async function get<T extends t.IUriResponse<any, any>>(args: {
  uri: string;
  getModel: t.GetModel;
  getUrls: t.GetUrls;
}): Promise<t.IPayload<T> | t.IErrorPayload> {
  const { uri, getModel, getUrls } = args;
  try {
    const res = await getCoord<T>({ uri, getModel, getUrls });
    return res;
  } catch (error) {
    console.log('error.stack', error.stack);
    const err = `Failed to get info for [${uri}]. ${error.message}`;
    return util.toErrorPayload(err);
  }
}
