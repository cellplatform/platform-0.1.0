import { constants, fs, routes, t, time } from '../common';

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

    const deployedAt = !args.deployedAt
      ? undefined
      : {
          date: time.day(args.deployedAt).format(`DD MMM YYYY, hh:mm A`),
          time: args.deployedAt,
        };

    const { system } = constants.getSystem();
    let host = req.headers.host || '-';
    host = host.startsWith('localhost') ? `http://${host}` : `https://${host}`;

    console.log('req', req);

    const data: t.IResGetSysInfo = {
      provider: args.title || 'Untitled',
      system,
      host,
      region,
      time: 'UTC',
      deployedAt,
    };

    return {
      status: 200,
      data,
    };
  });
}
