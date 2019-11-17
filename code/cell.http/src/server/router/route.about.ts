import { t, constants } from '../common';
const { PKG } = constants;
const DEPS = PKG.dependencies;

const MODULE = {
  SCHEMA: '@platform/cell.schema',
};

/**
 * Initialize routes
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { router } = args;

  /**
   * Info
   */
  router.get('/', async req => {
    const version = {
      [PKG.name]: PKG.version,
      [MODULE.SCHEMA]: DEPS[MODULE.SCHEMA],
    };
    return {
      status: 200,
      data: {
        provider: args.title || 'Untitled',
        'cell.os': version,
      },
    };
  });
}
