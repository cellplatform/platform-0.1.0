import { Schema, t, util, value } from '../../common';

/**
 * Invoked before a [Row] is persisted to the DB.
 */
export const beforeRowSave: t.BeforeModelSave<t.IDbModelRowProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelRow;

  // Update hash.
  if (args.force || args.isChanged) {
    const uri = Schema.from.row(model.path).uri;
    const data: t.IRowData = { ...value.deleteUndefined(model.toObject()) };
    delete data.hash;
    model.props.hash = util.hash.row({ uri, data });
  }
};
