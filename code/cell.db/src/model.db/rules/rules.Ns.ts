import { Schema, t, util, value, constants } from '../../common';
import * as models from '../../model.helpers';

const { SCHEMA_VERSION } = constants;

/**
 * Invoked before an [Ns] is persisted to the DB.
 */
export const beforeNsSave: t.BeforeModelSave<t.IDbModelNsProps> = async args => {
  const { isChanged } = args;
  const model = args.model as t.IDbModelNs;
  const schema = Schema.from.ns(model.path);
  const props = model.props.props || {};

  // Ensure the namespace id exists on the props.
  if (!model.props.id) {
    model.props.id = schema.parts.id;
  }

  // Update the current [schema] version the model is being saved using.
  if ((isChanged || !props.schema) && props.schema !== SCHEMA_VERSION) {
    const schema = SCHEMA_VERSION;
    models.setProps(model, { schema });
  }

  // Update hash.
  if (args.force || isChanged) {
    const uri = schema.uri;
    const ns: t.INs = { ...value.deleteUndefined(model.toObject()), hash: undefined };
    delete ns.hash;
    const data = await models.ns.getChildData({ model, cells: true, rows: true, columns: true });
    model.props.hash = util.hash.ns({ uri, ns, data });
  }
};
