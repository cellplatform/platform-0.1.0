import { models, Schema, t } from '../common';
import * as util from './util';

export async function getTypes(args: {
  host: string;
  db: t.IDb;
  id: string;
  query: t.IUrlQueryNsTypes;
}) {
  const { db, id, query, host } = args;
  const uri = Schema.uri.create.ns(id);
  const model = await models.Ns.create({ db, uri }).ready;
  const columns = await models.ns.getChildColumns({ model });

  const props = model.props.props || {};
  const name = props.name || 'Unnamed';

  const typescript = toTypescriptDeclaration({ name, columns });
  const data: t.IResGetNsTypes = { typescript };

  return { status: 200, data };
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
