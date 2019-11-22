import { t, Schema } from '../../common';

/**
 * Invoked before an [Ns] is persisted to the DB.
 */
export const beforeNsSave: t.BeforeModelSave<t.IDbModelNsProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelNs;
};
