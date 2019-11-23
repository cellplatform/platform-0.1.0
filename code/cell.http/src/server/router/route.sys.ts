import { t, fs, constants, id } from '../common';
import { ROUTES } from './ROUTES';

const PKG = constants.PKG;
const DEPS = PKG.dependencies;

const MODULE = {
  SCHEMA: '@platform/cell.schema',
};

/**
 * Initialize routes
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { router } = args;
  const region = fs.env.value('NOW_REGION') || 'local';

  /**
   * System info.
   */
  router.get(ROUTES.SYS.INFO, async req => {
    const version = {
      [PKG.name]: PKG.version,
      [MODULE.SCHEMA]: DEPS[MODULE.SCHEMA],
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
   * CUID
   * "Collision-resistant ids optimized for horizontal scaling and performance"
   */
  router.get(ROUTES.SYS.CUID, async req => {
    return {
      status: 200,
      data: { cuid: id.cuid() },
    };
  });
}
