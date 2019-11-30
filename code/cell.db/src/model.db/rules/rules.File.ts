import { Schema, t, util, value } from '../../common';

/**
 * Invoked before a [File] is persisted to the DB.
 */
export const beforeFileSave: t.BeforeModelSave<t.IDbModelFileProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelFile;
  const props = model.props.props || {};

  // Update the mime-type.
  if (!props.mimetype && props.name) {
    const mimetype = toMimetype(props.name);
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

/**
 * [Helpers]
 */

function toMimetype(name: string = '') {
  const index = name.lastIndexOf('.');
  if (index > -1) {
    const ext = name.substring(index + 1);
    switch (ext) {
      case 'txt':
        return 'plain/text';
        case 'css':
            return 'text/css';
          case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'ico':
        return 'image/x-icon';
      case 'gif':
        return 'image/gif';
      case 'zip':
        return 'application/zip';
      case 'pdf':
        return 'application/pdf';
      case 'js':
        return 'application/javascript';
    }
  }
  return; // No matching mime-type.
}
