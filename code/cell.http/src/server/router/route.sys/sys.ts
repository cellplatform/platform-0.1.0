import { constants, fs, id, ROUTES, t } from '../common';

const PKG = constants.PKG;
const DEPS = PKG.dependencies;

const MODULE = {
  SCHEMA: '@platform/cell.schema',
  DB: '@platform/cell.db',
};

/**
 * Initialize routes
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { router } = args;
  const region = fs.env.value('NOW_REGION') || 'local';

  /**
   * GET: System info.
   */
  router.get(ROUTES.SYS.INFO, async req => {
    const version = {
      [MODULE.SCHEMA]: DEPS[MODULE.SCHEMA],
      [PKG.name]: PKG.version,
      [MODULE.DB]: DEPS[MODULE.DB],
    };
    return {
      status: 200,
      data: {
        provider: args.title || 'Untitled',
        region,
        version,
      },
    };
  });

  /**
   * GET: /uid
   * "Collision-resistant ids optimized for horizontal scaling and performance"
   */
  router.get(ROUTES.SYS.UID, async req => {
    return {
      status: 200,
      data: { id: id.cuid(), type: 'cuid' },
    };
  });
}
