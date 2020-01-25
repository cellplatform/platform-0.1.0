import { constants, fs, routes, t, time } from '../common';

/**
 * Root information.
 */
export function init(args: { router: t.IRouter; title?: string; deployedAt?: number }) {
  const { router } = args;

  /**
   * GET: /, /.sys
   */
  router.get(routes.SYS.INFO, async req => {
    const NOW_REGION = fs.env.value('NOW_REGION');
    const region = NOW_REGION ? `cloud:${NOW_REGION}` : 'local';

    const deployed = !args.deployedAt
      ? undefined
      : {
          date: time.day(args.deployedAt).format(`DD MMM YYYY, hh:mm A`),
          utc: args.deployedAt,
        };

    const provider = args.title || 'Untitled';
    const system = constants.getSystem().system;
    let host = req.headers.host || '-';
    host = host.startsWith('localhost') ? `http://${host}` : `https://${host}`;

    const data: t.IResGetSysInfo = {
      provider,
      system,
      host,
      region,
      deployed,
    };

    return { status: 200, data };
  });
}
