import { t, Schema } from '../../common';

/**
 * Invoked before a [Column] is persisted to the DB.
 */
export const beforeColumnSave: t.BeforeModelSave<t.IDbModelColumnProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelColumn;
};
