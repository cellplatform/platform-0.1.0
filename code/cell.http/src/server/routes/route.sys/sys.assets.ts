import { ERROR, fs, routes, t, util } from '../common';

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
      const path = fs.resolve('static/favicon.ico');
      if (!(await fs.pathExists(path))) {
        const message = `Failed to open [favicon.ico] file`;
        return util.toErrorPayload(message, { status: 500, type: ERROR.HTTP.SERVER });
      }
      favicon = await fs.readFile(path);
    }
    return {
      headers: {
        'content-type': 'image/x-icon',
        'cache-control': `max-age=0, s-maxage=86400`, // 24-hours.
      },
      data: favicon,
    };
  });
}
