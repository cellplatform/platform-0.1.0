import { micro } from '..';
import { log } from '../common';
import { fs } from '@platform/fs';

import * as form from '../body/form';

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
  const formData = await form.parse(req);
  log.info(formData);

  const dir = fs.resolve('tmp/post');
  await Promise.all(
    formData.files.map(async file => {
      const path = fs.join(dir, file.filename);
      await fs.ensureDir(dir);
      await fs.writeFile(path, file.buffer);
    }),
  );

  // Finish up.
  const { method, url } = req;
  return {
    data: { url, method, files: formData.files.map(f => f.filename) },
  };
});

(async () => {
  const service = await app.listen({ port: 8080 });

  log.info('service:\n');
  log.info(' • isRunning:', service.isRunning);
  log.info(' • port:     ', service.port);
  log.info();

  // Example: stop the service.
  // setTimeout(() => service.close(), 1500);
})();
