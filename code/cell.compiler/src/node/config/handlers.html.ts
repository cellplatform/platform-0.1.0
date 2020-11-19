import { R, DEFAULT, t } from '../common';

/**
 * Handlers for configuring the host HTML page.
 */
export const htmlMethods = (model: t.BuilderModel<t.CompilerModel>) => {
  const res: t.CompilerModelMethodsHtml = {
    inject(value) {
      model.change((draft) => (Model(draft).html.inject = value));
      return res;
    },
    head(value) {
      model.change((draft) => (Model(draft).html.head = value));
      return res;
    },
    body(value) {
      model.change((draft) => (Model(draft).html.body = value));
      return res;
    },
  };
  return res;
};

/**
 * [Helpers]
 */

const Model = (model: t.CompilerModel) => {
  return {
    toObject: () => model,
    get html() {
      return model.html || (model.html = {});
    },
  };
};
