import { Schema, t, util, value } from '../../common';
import * as models from '../../model.helpers';

/**
 * Invoked before an [Ns] is persisted to the DB.
 */
export const beforeNsSave: t.BeforeModelSave<t.IDbModelNsProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelNs;
  const schema = Schema.from.ns(model.path);

  // Ensure the namespace id exists on the props.
  if (!model.props.id) {
    model.props.id = schema.parts.id;
  }

  // Update hash.
  if (args.force || args.isChanged) {
    const uri = schema.uri;
    const ns: t.INs = { ...value.deleteUndefined(model.toObject()), hash: undefined };
    const data = await models.ns.getChildData({ model, cells: true, rows: true, columns: true });
    model.props.hash = util.hash.ns({ uri, ns, data });
  }
};
