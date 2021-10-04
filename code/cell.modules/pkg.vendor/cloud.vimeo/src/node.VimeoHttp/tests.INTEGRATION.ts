import { expect, Http } from '../test';
import { VimeoHttp } from '.';

const token = process.env.VIMEO_TEST_TOKEN ?? '';
const headers = { Authorization: `bearer ${token}` };

describe('INTEGRATION', () => {
  it.only('me', async () => {
    const client = VimeoHttp({ token });
    const res = await client.me();

    console.log('-------------------------------------------');
    console.log('res', res);
    console.log('-------------------------------------------');
    console.log('uploadQuota', res.user?.uploadQuota);
  });

  describe('thumbnail', () => {
    it.only('list', async () => {
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
});
