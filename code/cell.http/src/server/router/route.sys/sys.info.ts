import { constants, fs, ROUTES, t } from '../common';

const PKG = constants.PKG;
const DEPS = PKG.dependencies;

const MODULE = {
  SCHEMA: '@platform/cell.schema',
  DB: '@platform/cell.db',
};

/**
 * Root information.
 */
export function init(args: { router: t.IRouter, title?: string }) {
  const { router } = args;
  const region = fs.env.value('NOW_REGION') || 'local';

  router.get(ROUTES.SYS.INFO, async req => {
    const version = {
      [MODULE.SCHEMA]: (DEPS || {})[MODULE.SCHEMA],
      [PKG.name]: PKG.version,
      [MODULE.DB]: (DEPS || {})[MODULE.DB],
    };
    return {
      status: 200,
      data: {
        system: args.title || 'Untitled',
        region,
        version,
      },
    };
  });
}
