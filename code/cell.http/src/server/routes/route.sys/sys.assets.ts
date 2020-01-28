import { constants, fs, routes, t, time } from '../common';

/**
 * Root information.
 */
export function init(args: { router: t.IRouter; title?: string; deployedAt?: number }) {
  const { router } = args;
  let favicon: Buffer | undefined;

  /**
   * GET: /favicon.ico
   */
  router.get(routes.SYS.FAVICON, async req => {
    if (!favicon) {
      const path = fs.join(constants.PATH.MODULE, 'static/favicon.ico');
      favicon = await fs.readFile(path);
    }
    return {
      headers: { 'content-type': 'image/x-icon' },
      data: favicon,
    };
  });
}
