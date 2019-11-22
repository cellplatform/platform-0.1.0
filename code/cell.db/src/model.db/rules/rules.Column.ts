import { Schema, t, util } from '../../common';

/**
 * Invoked before a [Column] is persisted to the DB.
 */
export const beforeColumnSave: t.BeforeModelSave<t.IDbModelColumnProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelColumn;

  // Update hash.
  if (changes.length > 0) {
    const uri = Schema.from.column(model.path).uri;
    const data = { ...model.toObject(), hash: undefined };
    model.props.hash = util.hash.column({ uri, data });
  }
};
