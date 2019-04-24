import { json } from 'body-parser';
import * as express from 'express';

import { fs, is } from '../common';
import * as router from '../router';

/**
 * Initializes a new base web server.
 */
export function init(args: { name: string }) {
  const { name } = args;
  const dir = is.prod ? '/data' : fs.resolve('./tmp');

  const getContext = async () => {
    return { name, dir };
  };

  const routes = router.create({ getContext });
  const server = express()
    .use(json())
    .use(routes);

  return { server, dir };
}
