import { micro } from '..';

const PKG = require('../../package.json') as { name: string; version: string };
const log = { package: PKG.name, version: PKG.version };

const { server, router } = micro.init({ log });

router.get('/foo', async req => {
  return { status: 200, data: { message: 'hello' } };
});

server.listen({ port: 1234 });
