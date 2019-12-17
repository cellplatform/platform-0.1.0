import { Schema, t, util, value } from '../../common';

/**
 * Invoked before a [File] is persisted to the DB.
 */
export const beforeFileSave: t.BeforeModelSave<t.IDbModelFileProps> = async args => {
  const model = args.model as t.IDbModelFile;
  const props = model.props.props || {};

  // Update the mime-type.
  if (!props.mimetype && props.filename) {
    const mimetype = util.toMimetype(props.filename);
    model.set({ props: { ...props, mimetype } });
  }

  // Update hash.
  if (args.force || args.isChanged) {
    const uri = Schema.from.file(model.path).uri;
    const data: t.IFileData = { ...value.deleteUndefined(model.toObject()) };
    delete data.hash;
    model.props.hash = util.hash.file({ uri, data });
  }
};
