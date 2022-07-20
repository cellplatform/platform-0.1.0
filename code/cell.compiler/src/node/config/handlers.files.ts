import { t } from '../common';

/**
 * Handlers for configuring how generated files are treated.
 */
export const filesMethods = (model: t.BuilderModel<t.CompilerModel>) => {
  const res: t.CompilerModelMethodsFiles = {
    /**
     * Assigns 'public' or 'private' permission to output files matching the
     * given grep pattern.  This is useful for scenarios like S3
     *
     * Default: 'private'
     *
     */
    access(permission, grep) {
      model.change((draft) => {
        const model = Model(draft);
        model.access.push({ permission, grep });
      });
      return res;
    },
  };
  return res;
};

/**
 * [Helpers]
 */

const Model = (model: t.CompilerModel) => {
  const res = {
    toObject: () => model,
    get files() {
      return model.files || (model.files = {});
    },
    get access() {
      const files = res.files;
      return files.access || (files.access = []);
    },
  };
  return res;
};
