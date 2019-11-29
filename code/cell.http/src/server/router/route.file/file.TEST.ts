import { t, expect, http, createMock, stripHashes, post, fs, FormData } from '../../../test';

describe('route: file', () => {
  describe('invalid URI', () => {
    const test = async (path: string, expected: string) => {
      const mock = await createMock();
      const url = mock.url(path);
      const res = await http.get(url);
      await mock.dispose();

      const body = res.json();

      expect(res.status).to.eql(400);
      expect(body.error.type).to.eql('HTTP/uri/malformed');
      expect(body.error.message).to.contain('Malformed');
      expect(body.error.message).to.contain(expected);
    };

    it('malformed: no id', async () => {
      const msg = 'does not contain a namespace-identifier';
      await test('/file:.123', msg);
    });
  });

  describe('POST', () => {
    it('post binary file', async () => {
      const mock = await createMock();

      // Prepare the [multipart/form-data] to post.
      const png = await fs.readFile(fs.resolve('src/test/images/bird.png'));
      const form = new FormData();
      form.append('image', png, {
        filename: `image.png`,
        contentType: 'application/octet-stream',
      });
      const headers = form.getHeaders();
      const uri = 'file:foo.bird';
      const res = await http.post(mock.url(uri), form, { headers });

      mock.dispose();

      console.log('-------------------------------------------');
      console.log('res', res);

      // Ensure saved file matches POSTed file.
      const file = await fs.readFile(fs.resolve('tmp/fs/ns.foo/bird'));
      expect(file.toString()).to.eql(png.toString());
    });
  });
});
