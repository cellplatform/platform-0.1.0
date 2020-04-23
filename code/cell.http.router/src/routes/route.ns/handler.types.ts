import { models, Schema, t, ERROR, TypeSystem, HttpClient } from '../common';
import * as util from './util';

export async function getTypes(args: {
  host: string;
  db: t.IDb;
  id: string;
  query: t.IUrlQueryNsTypes;
}) {
  try {
    const { id, query, host } = args;
    const uri = Schema.uri.create.ns(id);
    const client = HttpClient.create(host);
    const defs = (await TypeSystem.client(client).load(uri)).defs;

    const data: t.IResGetNsTypes = {
      uri,
      types: defs.map(({ typename, columns }) => ({ typename, columns })),
    };

    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
