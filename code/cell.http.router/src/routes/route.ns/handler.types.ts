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
    const client = TypeSystem.client(HttpClient.create(host));

    // Read in the type-definitions.
    const res = await client.load(uri);
    if (!res.ok) {
      const err = `Failed to retrieve type definitions for (${uri.toString()})`;
      const status = res.errors.some(err => err.type === 'TYPE/notFound') ? 404 : 500;
      return util.toErrorPayload(err, { status, children: res.errors });
    }

    // Transform into response type.
    const data: t.IResGetNsTypes = {
      uri,
      types: res.defs.map(({ typename, columns }) => ({ typename, columns })),
    };

    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
