import { constants, fs, routes, t, time } from '../common';

const PKG = constants.PKG;
const DEPS = PKG.dependencies || {};

/**
 * Root information.
 */
export function init(args: { router: t.IRouter; title?: string; deployedAt?: number }) {
  const { router } = args;

  /**
   * GET: /, /.info
   */
  router.get(routes.SYS.INFO, async req => {
    const NOW_REGION = fs.env.value('NOW_REGION');
    const region = NOW_REGION ? `cloud:${NOW_REGION}` : 'local';

    const version: t.IResGetSysInfo['version'] = {
      '@platform/cell.schema': DEPS['@platform/cell.schema'],
      '@platform/cell.types': DEPS['@platform/cell.types'],
      '@platform/cell.http': PKG.version || '',
    };

    const deployedAt = !args.deployedAt
      ? undefined
      : {
          datetime: time.day(args.deployedAt).format(`DD MMM YYYY, hh:mm A`),
          timestamp: args.deployedAt,
        };

    const data: t.IResGetSysInfo = {
      system: args.title || 'Untitled',
      domain: req.headers.host || '',
      region,
      time: 'UTC',
      version,
      deployedAt,
    };

    return {
      status: 200,
      data,
    };
  });
}
