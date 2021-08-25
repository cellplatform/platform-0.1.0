/* eslint-disable @typescript-eslint/no-var-requires */

import { micro } from '..';
import { log, time } from '../common';

import { fs } from '@platform/fs';

const timer = time.timer();
const PKG = require('../../package.json') as { name: string; version: string };

const app = micro.create({
  cors: true,
  log: { package: log.white(PKG.name), version: PKG.version },
});

app.router
  .get(['/', '/foo'], async (req) => {
    log.info('GET', req.url);
    return {
      status: 200,
      headers: { 'x-foo': 'hello' },
      data: { message: 'hello' },
    };
  })
  .post('/foo', async (req) => {
    type MyBody = { foo: string | number };
    const body = await req.body.json<MyBody>({ default: { foo: 'DEFAULT_VALUE' } });
    log.info('POST', req.url, body);
    const { method, url } = req;
    return { data: { url, method, body } };
  })
  .get('/bird', async (req) => {
    // Node <buffer>
    const buffer = await fs.readFile(fs.resolve('src/test/images/bird.png'));

    // Newer standard of binary data.
    const array = new Uint8Array(buffer);

    // HACK: For the [Uint8Array] to render, it needs to be served as a node Buffer.
    const data = Buffer.from(array);

    return {
      headers: { 'content-type': 'image/png' },
      data,
    };
  });

/**
 * POST: multipart/form-data
 */
app.router.post('/file', async (req) => {
  const data = await req.body.form();
  log.info(data);
  log.info();

  const dir = fs.resolve('tmp/file');
  await Promise.all(
    data.files.map(async (file) => {
      const path = fs.join(dir, file.name);
      await fs.ensureDir(dir);
      await fs.writeFile(path, file.buffer);
    }),
  );

  // Finish up.
  const { method, url } = req;
  const files = data.files.map((f) => f.name);
  return {
    data: { url, method, dir, files },
  };
});

(async () => {
  // const service = await app.start({ port: '8080:1234' });
  const service = await app.start({ port: 1234 });

  log.info.yellow(`
    started in:     ${timer.elapsed.toString()} (total elapsed)
    service:
    • isRunning:   ${service.isRunning}
    • port:        ${service.port}
`);

  // Example: stop the service.
  // setTimeout(() => service.close(), 1500);
})();
