import { constants, fs, routes, t, time, ERROR } from '../common';

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
      // const path = fs.join(constants.PATH.MODULE, 'static/favicon.ico');
      const path = fs.resolve('static/favicon.ico');
      if (!(await fs.pathExists(path))) {
        const status = 500;
        const message = `Failed to open file: ${path}`;
        const error: t.IHttpError = { type: ERROR.HTTP.SERVER, status, message };
        return { status, error };
      }
      favicon = await fs.readFile(path);
    }
    return {
      headers: { 'content-type': 'image/x-icon' },
      data: favicon,
    };
  });
}
