import { models, Schema, t, ERROR, TypeSystem, HttpClient, wildcard } from '../common';
import * as util from './util';

export async function getTypes(args: {
  host: string;
  db: t.IDb;
  id: string;
  query: t.IReqQueryNsTypes;
}) {
  try {
    const { host } = args;
    const uri = Schema.uri.create.ns(args.id);

    // Read in the type-definitions.
    const client = TypeSystem.client(HttpClient.create(host));
    const res = await client.load(uri);
    if (!res.ok) {
      const err = `Failed to retrieve type definitions for (${uri.toString()})`;
      const status = res.errors.some(err => err.type === 'TYPE/notFound') ? 404 : 500;
      return util.toErrorPayload(err, { status, children: res.errors });
    }

    // Filter on typenames.
    const defs = res.defs.filter(def => {
      const { typename } = args.query;
      if (typename === undefined) {
        return true;
      } else if (typeof typename === 'boolean') {
        return typename;
      } else {
        const typenames = Array.isArray(typename) ? typename : [typename];
        return typenames.some(typename => {
          return typename?.includes('*')
            ? wildcard.isMatch(def.typename, typename)
            : typename === def.typename;
        });
      }
    });

    // Generate types and [.d.ts] typescript symbols.
    type Types = t.IResGetNsTypes['types'];
    const types: Types = defs.map(({ typename, columns }) => ({ typename, columns }));
    const typescript = TypeSystem.Client.typescript(defs, { header: false }).toString();

    // Transform into response type.
    const data: t.IResGetNsTypes = {
      uri,
      types,
      typescript,
    };

    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
