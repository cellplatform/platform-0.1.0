import { micro } from '..';
import { log } from '../common';

const PKG = require('../../package.json') as { name: string; version: string };

const app = micro.init({
  log: { package: log.white(PKG.name), version: PKG.version },
});

app.router.get('/foo', async req => {
  return { status: 200, data: { message: 'hello' } };
});

app.listen({ port: 1234 });
