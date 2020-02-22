import { models, Schema, t, ERROR } from '../common';
import * as util from './util';
import { TypeNs } from './TEMP';

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
    const nsType = props.type;

    if (!nsType) {
      const err = `The namespace does not contain a type declaration. (${uri})`;
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.TYPE });
    }

    // const title = props.title || 'Unnamed';
    const name = (nsType.name || '').trim() || 'Unnamed';

    console.log('model.toObject()', model.toObject());

    const tns = TypeNs.create({});

    console.log('tns', tns);

    const typescript = toTypescriptDeclaration({ name, columns });
    const data: t.IResGetNsTypes = {
      uri,
      'types.d.ts': typescript,
    };

    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

/**
 * [Helpers]
 */

function toTypescriptDeclaration(args: { name: string; columns: t.IColumnData }) {
  const name = `${args.name[0].toUpperCase()}${args.name.substring(1)}`;

  const lines = Object.keys(args.columns)
    .sort()
    .map(key => ({ key, props: args.columns[key].props }))
    .filter(({ props }) => Boolean(props))
    .map(({ key, props }) => {
      const { name, type } = props;
      return `    ${name}: ${type};`;
    });

  return `
export declare type ${name} = {
${lines.join('\n')}
};`.substring(1);
}
