import { constants, fs, ROUTES, t, time } from '../common';

const PKG = constants.PKG;
const DEPS = PKG.dependencies;

const MODULE = {
  SCHEMA: '@platform/cell.schema',
  DB: '@platform/cell.db',
};

/**
 * Root information.
 */
export function init(args: { router: t.IRouter; title?: string; deployedAt?: number }) {
  const { router, deployedAt = -1 } = args;

  /**
   * GET: /, /.info
   */
  router.get(ROUTES.SYS.INFO, async req => {
    const NOW_REGION = fs.env.value('NOW_REGION');
    const region = NOW_REGION ? `cloud:${NOW_REGION}` : 'local';

    const version: t.IResGetInfo['version'] = {
      [MODULE.SCHEMA]: (DEPS || {})[MODULE.SCHEMA],
      [PKG.name || '']: PKG.version || '-',
      [MODULE.DB]: (DEPS || {})[MODULE.DB],
    };

    const data: t.IResGetInfo = {
      system: args.title || 'Untitled',
      domain: req.headers.host || '',
      region,
      version,
      deployedAt: {
        datetime: time.day(deployedAt).format(`DD MMM YYYY, hh:mm A`),
        timestamp: deployedAt,
        timezone: fs.env.value('TZ') || '-',
      },
    };

    return {
      status: 200,
      data,
    };
  });
}
