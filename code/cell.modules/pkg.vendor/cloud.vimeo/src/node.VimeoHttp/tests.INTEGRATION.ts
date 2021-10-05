import { expect, Http, nodefs } from '../test';
import { VimeoHttp } from '.';

import * as tus from 'tus-js-client';

const token = process.env.VIMEO_TEST_TOKEN ?? '';
const headers = { Authorization: `bearer ${token}` };

describe('INTEGRATION', function () {
  this.timeout(300000);

  it('me', async () => {
    const client = VimeoHttp({ token });
    const res = await client.me();

    console.log('-------------------------------------------');
    console.log('res', res);
    console.log('-------------------------------------------');
    console.log('uploadQuota', res.user?.uploadQuota);
  });

  describe('thumbnail', () => {
    it('list', async () => {
      const client = VimeoHttp({ token });
      const video = 598788467;
      const res = await client.thumbnails.list(video);

      console.log('-------------------------------------------');
      console.log('res', res);
      expect(res.status).to.eql(200);
    });

    it('get (single)', async () => {
      const client = VimeoHttp({ token });

      const video = 598788467;
      const picture = 1234134333;

      const res = await client.thumbnails.get(video, picture);
      console.log('-------------------------------------------');
      console.log('res', res);
      expect(res.status).to.eql(200);
    });
  });

  describe('upload', () => {
    it.only('upload video', async () => {
      const client = VimeoHttp({ token });

      const path = nodefs.resolve('tmp/sample.webm');
      const res = client.upload(path, { name: 'foobar' });

      res.progress$.subscribe((e) => {
        console.log(' > ', e);
      });

      console.log('-------------------------------------------');
      console.log(await res);
    });
  });
});
