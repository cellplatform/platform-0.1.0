import * as express from 'express';
import { json } from 'body-parser';
import { fs, is } from '../common';
import * as router from '../router';

export function init(args: { name: string }) {
  const dir = is.prod ? '/data' : fs.resolve('./tmp');
  const getContext = async () => {
    const name = args.name;
    return { name, dir };
  };

  const routes = router.create({ getContext });
  const server = express()
    .use(json())
    .use(routes);

  return { server, dir };
}
