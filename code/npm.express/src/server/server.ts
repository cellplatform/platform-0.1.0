import { json } from 'body-parser';
import * as express from 'express';

import { fs, is, t } from '../common';
import * as router from '../router';

/**
 * Initializes a new base web server.
 */
export function init(args: { name: string; prerelease?: t.NpmPrerelease; urlPrefix?: string }) {
  const { name } = args;
  const prerelease = args.prerelease || false;
  const downloadDir = is.prod ? '/data' : fs.resolve('./tmp');

  let urlPrefix = (args.urlPrefix || '').replace(/^\//, '').replace(/\/$/, '');
  urlPrefix = `/${urlPrefix}`;

  const getContext = async () => {
    return { name, downloadDir, prerelease };
  };

  const routes = router.create({ getContext });
  const server = express()
    .use(json())
    .use(urlPrefix, routes);

  return { server, downloadDir, urlPrefix, prerelease };
}
