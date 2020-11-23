import { R, DEFAULT, t, Builder } from '../common';
import { Redirects, validate } from './util';

/**
 * Handlers for configuring how generated files are treated.
 */
export const filesMethods = (model: t.BuilderModel<t.CompilerModel>) => {
  const res: t.CompilerModelMethodsFiles = {
    /**
     * Assign redirection rules for a file.
     *
     * By default files on S3 are stored and a 307 redirect is issued when the
     * request to the origin server is made for the file.
     *
     * By DENY-ing (false) the redirect, the server performs a "pass through" whereby
     * it pulls the file from S3 then streams it to the requesting client.
     *
     * This is not the default behavior, and is SLOWER and EXPENSIVE (incurring additional
     * CPU and bandwidth costs) however may be necessary in some cases where redirects
     * cause security issues on the client (aka CORS "cross-origin resource sharing").
     *
     */
    redirect(inputAction, inputGrep) {
      model.change((draft) => {
        type A = t.CompilerModelRedirectAction;

        if (
          inputAction !== undefined &&
          !(typeof inputAction === 'string' || typeof inputAction === 'boolean')
        ) {
          throw new Error(`Invalid grant action '${inputAction}'.`);
        }

        // Derive the given grant.
        let action: A | undefined = undefined;
        if (typeof inputAction === 'string') {
          action = inputAction;
          const GRANTS: A[] = ['ALLOW', 'DENY'];
          if (!GRANTS.includes(action)) {
            throw new Error(`Invalid grant action '${action}' must be ALLOW or DENY.`);
          }
        }
        if (typeof inputAction === 'boolean') {
          action = inputAction ? 'ALLOW' : 'DENY';
        }

        const grep = Builder.format.string(inputGrep, { default: undefined, trim: true });

        // Update model.
        if (action === undefined && grep === undefined) {
          Model(draft).files.redirects = undefined;
        } else {
          const model = Model(draft);
          model.redirects.push({ action, grep });
          model.files.redirects = Redirects(model.redirects).sortAndOrder();
        }
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
    get redirects() {
      const files = res.files;
      return files.redirects || (files.redirects = []);
    },
  };
  return res;
};
