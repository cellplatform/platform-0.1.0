import { Schema, t, util, value } from '../../common';

/**
 * Invoked before a [File] is persisted to the DB.
 */
export const beforeFileSave: t.BeforeModelSave<t.IDbModelFileProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelFile;

  // Update hash.
  if (args.force || args.isChanged) {
    const uri = Schema.from.file(model.path).uri;
    const data: t.IFileData = { ...value.deleteUndefined(model.toObject()) };
    delete data.hash;
    model.props.hash = util.hash.file({ uri, data });
  }
};
