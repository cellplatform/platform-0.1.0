import { models, Schema, t, ERROR } from '../common';
import * as util from './util';
import { TypeSystem, fetcher } from '../../../TypeSystem';

export async function getTypes(args: {
  host: string;
  db: t.IDb;
  id: string;
  query: t.IUrlQueryNsTypes;
}) {
  try {
    const { db, id, query, host } = args;
    const uri = Schema.uri.create.ns(id);
    const model = await models.Ns.create({ db, uri }).ready;
    const columns = await models.ns.getChildColumns({ model });

    const props = model.props.props || {};
    // const nsType = props.type;

    if (!props.type) {
      const err = `The namespace does not contain a type declaration. (${uri})`;
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.TYPE });
    }

    /**
     * TODO 🐷
     */
    // const title = props.title || 'Unnamed';
    // const typename = (props.type.typename || '').trim() || 'Unnamed';
    const fetch = fetcher.fromClient({ client: host });

    const type = await TypeSystem.Ns.load({ fetch, ns: uri });

    const data: t.IResGetNsTypes = {
      uri,
      types: type.types,
      typescript: type.typescript,
    };

    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
