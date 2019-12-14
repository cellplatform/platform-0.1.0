import { micro } from '..';
import { log, time } from '../common';

import { fs } from '@platform/fs';

const timer = time.timer();
const PKG = require('../../package.json') as { name: string; version: string };

const app = micro.init({
  cors: true,
  log: { package: log.white(PKG.name), version: PKG.version },
});

app.router
  .get('/foo', async req => {
    log.info('GET', req.url);
    return {
      status: 200,
      headers: { 'x-foo': 'hello' },
      data: { message: 'hello' },
    };
  })
  .post('/foo', async req => {
    type MyBody = { foo: string | number };
    const body = await req.body.json<MyBody>({ default: { foo: 'DEFAULT_VALUE' } });
    log.info('POST', req.url, body);
    const { method, url } = req;
    return { data: { url, method, body } };
  });

/**
 * POST: multipart/form-data
 */
app.router.post('/file', async req => {
  const data = await req.body.form();
  log.info(data);
  log.info();

  const dir = fs.resolve('tmp/file');
  await Promise.all(
    data.files.map(async file => {
      const path = fs.join(dir, file.name);
      await fs.ensureDir(dir);
      await fs.writeFile(path, file.buffer);
    }),
  );

  // Finish up.
  const { method, url } = req;
  const files = data.files.map(f => f.name);
  return {
    data: { url, method, dir, files },
  };
});

(async () => {
  const service = await app.start({ port: 8080 });

  log.info.green(`
  started in:    ${timer.elapsed.toString()}
  service:
  • isRunning:   ${service.isRunning}
  • port:        ${service.port}
  `);

  // Example: stop the service.
  // setTimeout(() => service.close(), 1500);
})();
