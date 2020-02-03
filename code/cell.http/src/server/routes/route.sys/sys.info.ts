import { constants, fs, routes, t, time, id } from '../common';

/**
 * Root information.
 */
export function init(args: { router: t.IRouter; title?: string; deployedAt?: number }) {
  const { router } = args;

  const formatDate = (timestamp: number) => {
    const date = time.day(args.deployedAt).toString();
    return `${date}|UTC:${timestamp}`;
  };

  /**
   * GET: /, /.sys
   */
  router.get(routes.SYS.INFO, async req => {
    const NOW_REGION = fs.env.value('NOW_REGION');
    const region = NOW_REGION ? `cloud:${NOW_REGION}` : 'local:device';

    const provider = args.title || 'Untitled';
    const system = constants.getSystem().system;
    const host = req.headers.host || '-';
    const deployed = !args.deployedAt ? undefined : formatDate(args.deployedAt);

    const data: t.IResGetSysInfo = {
      provider,
      host,
      system,
      region,
      deployed,
    };

    return { status: 200, data };
  });

  /**
   * GET: /uid
   */
  router.get(routes.SYS.UID, async req => {
    const ids = Array.from({ length: 10 }).map(() => id.cuid());
    const data: t.IResGetSysUid = { ids };
    return { status: 200, data };
  });
}
