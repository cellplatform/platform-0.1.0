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
export function init(args: { router: t.IRouter; title?: string }) {
  const { router } = args;

  /**
   * GET: /
   */
  router.get(ROUTES.SYS.INFO, async req => {
    const NOW_REGION = fs.env.value('NOW_REGION');
    const region = NOW_REGION ? `cloud/${NOW_REGION}` : 'local';

    const version = {
      [MODULE.SCHEMA]: (DEPS || {})[MODULE.SCHEMA],
      [PKG.name]: PKG.version,
      [MODULE.DB]: (DEPS || {})[MODULE.DB],
    };

    return {
      status: 200,
      data: {
        system: args.title || 'Untitled',
        domain: req.headers.host,
        region,
        version,
      },
    };
  });
}
