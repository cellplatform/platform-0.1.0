import { Schema, t, util } from '../../common';

/**
 * Invoked before an [Ns] is persisted to the DB.
 */
export const beforeNsSave: t.BeforeModelSave<t.IDbModelNsProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelNs;

  // Update hash.
  if (changes.length > 0) {
    const uri = Schema.from.ns(model.path).uri;
    const data = { ...model.toObject(), hash: undefined };
    console.log('data', data);
    // model.props.hash = util.hash.cell({ uri, data });
  }
};
