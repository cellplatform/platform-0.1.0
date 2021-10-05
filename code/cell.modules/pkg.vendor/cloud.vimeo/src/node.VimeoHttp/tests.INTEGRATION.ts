import { expect, TestOS } from '../test';
import { VimeoHttp } from '.';

const token = process.env.VIMEO_TEST_TOKEN ?? '';
const fs = TestOS.fs;

describe('INTEGRATION', function () {
  this.timeout(300000);

  it.skip('me', async () => {
    const client = VimeoHttp({ token, fs });
    const res = await client.me();

    console.log('-------------------------------------------');
    console.log('res', res);
    console.log('-------------------------------------------');
    console.log('uploadQuota', res.user?.uploadQuota);
  });

  describe('thumbnail', () => {
    it.skip('list', async () => {
      const client = VimeoHttp({ token, fs });
      const video = 598788467;
      const res = await client.thumbnails.list(video);

      console.log('-------------------------------------------');
      console.log('res', res);

      console.log('-------------------------------------------');
      console.log('res.sizes', res.thumbnails[0].sizes);

      expect(res.status).to.eql(200);
    });

    it.skip('get (single)', async () => {
      const client = VimeoHttp({ token, fs });

      const video = 598788467;
      const picture = 1234134333;

      const res = await client.thumbnails.get(video, picture);
      console.log('-------------------------------------------');
      console.log('res', res);
      expect(res.status).to.eql(200);
    });
  });

  describe('upload', () => {
    it('TMP', async () => {
      const path = 'sample.webm';

      const file = await fs.read(path);
      console.log('file', file?.byteLength);

      console.log('Blob', Blob);

      if (file) {
        const blob = new Blob([file]);

        console.log('-------------------------------------------');
        console.log('blob', blob);
      }

      // console.log('Blob', Buffer);
    });

    it.only('upload video', async () => {
      const client = VimeoHttp({ token, fs });

      const path = 'sample.webm';
      const promise = client.upload(path, { name: 'hello' });

      promise.progress$.subscribe((e) => {
        console.log(' > ', e);
      });

      console.log('-------------------------------------------');
      console.log(await promise);
    });
  });
});
