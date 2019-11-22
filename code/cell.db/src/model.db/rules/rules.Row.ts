import { Schema, t, util } from '../../common';

/**
 * Invoked before a [Row] is persisted to the DB.
 */
export const beforeRowSave: t.BeforeModelSave<t.IDbModelRowProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelRow;

  // Update hash.
  if (changes.length > 0) {
    const uri = Schema.from.row(model.path).uri;
    const data = { ...model.toObject(), hash: undefined };
    model.props.hash = util.hash.row({ uri, data });
  }
};
