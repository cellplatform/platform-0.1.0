/* eslint-disable */

import { createMock, expect, fs, http, readFile, t, util } from '../../test';

const bodyToText = async (body?: ReadableStream | string) => {
  if (!body) {
    return '';
  }
  if (typeof body === 'string') {
    return body;
  } else {
    const path = fs.resolve(`tmp/test/index.html`);
    await fs.stream.save(path, body);
    return (await fs.readFile(path)).toString();
  }
};

describe('cell/files: download', function () {
  this.timeout(50000);

  describe('http (raw URLs)', () => {
    it('download byFileUri', async () => {
      const mock = await createMock();
      const cellUri = 'cell:foo:A1';
      const client = mock.client.cell(cellUri);

      // Upload HTML file.
      const data = await readFile('src/test/assets/file.js');
      const uploaded = await client.files.upload({ filename: 'm.foo.js', data });
      const fileUri = uploaded.body.files[0].uri;

      const urls = mock.urls.cell(cellUri).file;
      const url1 = urls.byFileUri(fileUri).toString(); //       NB: without file-extension.
      const url2 = urls.byFileUri(fileUri, 'js').toString(); // NB: with file-extension.

      const res1 = await http.get(url1);
      const res2 = await http.get(url2);

      expect(res1.status).to.eql(200);
      expect(res2.status).to.eql(200);

      expect(await bodyToText(res1.body)).to.eql(data.toString());
      expect(await bodyToText(res2.body)).to.eql(data.toString());

      expect(res1.headers['content-type']).to.eql('application/octet-stream'); // NB: no file-extension.
      expect(res2.headers['content-type']).to.eql('application/javascript'); //   NB: file-extension ".js"

      // Finish up.
      await mock.dispose();
    });

    it('download byName', async () => {
      const mock = await createMock();
      const cellUri = 'cell:foo:A1';
      const client = mock.client.cell(cellUri);
      const urls = mock.urls.cell(cellUri);

      const test = async (source: string, filename: string, matchContent?: string) => {
        const path = fs.join('src/test/assets', source);
        const data = await readFile(path);
        await client.files.upload({ filename, data });

        const url = urls.file.byName(filename).toString();
        const res = await http.get(url);

        expect(res.status).to.eql(200);

        const contentType = (res.headers['content-type'] || '').toString();
        const mime = util.toMimetype(filename) || 'application/octet-stream';
        expect(contentType).to.eql(mime);

        const content = contentType.startsWith('text/') ? res.text : await bodyToText(res.body);
        if (matchContent) {
          expect(content).to.include(matchContent);
        } else {
          expect(content).to.eql(data.toString());
        }
      };

      await test('file.js', 'file.js');
      await test('file.js', '//file.js');
      await test('file.js', 'm.foo.png');
      await test('file.js', 'm.foo.bar.z.pdf');
      await test('file.js', 'm.foo.bar');
      await test('file.js', 'm.foo.bar/foo/z/p.file.js');
      await test('file.js', 'parcel-v1.react.application/dist/foo.js');
      await test('file.js', 'foobar/index.html');

      await test('file.js', 'root/foobar/index.js');
      await test('file.js', 'root/foo_bar/index.js');
      await test('file.js', 'root/foo-bar/index.js');

      const html = '<title>My Title</title>';
      await test('index.html', 'index.html', html);
      await test('index.html', 'foo/bar_zoo.v1/dist/index.html', html);
      await test('index.html', 'foo/bar-zoo.v2/dist/index.html', html);

      // Finish up.
      await mock.dispose();
    });
  });

  describe('http (using [http.client] wrapper)', () => {
    it('no file extension (content-type: "application/octet-stream")', async () => {
      const mock = await createMock();
      const cellUri = 'cell:foo:A1';
      const client = mock.client.cell(cellUri);

      // Upload HTML file.
      const filename = 'foo';
      const data = await readFile('src/test/assets/index.html');
      await client.files.upload({ filename, data });

      // Download the file and check headers.
      let headers: undefined | t.IHttpHeaders;
      mock.client.response$.subscribe((e) => (headers = e.response.headers));

      const res = await client.file.name(filename).download();
      const html = await bodyToText(res.body);

      expect(res.ok).to.eql(true);
      expect(headers && headers['content-type']).to.eql('application/octet-stream');
      expect(html).to.contain('<title>My Title</title>');

      // Finish up.
      await mock.dispose();
    });

    it('file path', async () => {
      const mock = await createMock();
      const cellUri = 'cell:foo:A1';
      const client = mock.client.cell(cellUri);

      // Upload HTML file.
      const data = await readFile('src/test/assets/index.html');
      await client.files.upload({ filename: 'foo/bar/m.root.html', data });

      // Download the file and check headers.
      let headers: undefined | t.IHttpHeaders;
      mock.client.response$.subscribe((e) => (headers = e.response.headers));

      const res = await client.file.name('  ///foo/bar/m.root.html  ').download(); // NB: path prefix slahses "/" are trimmed.
      const html = await bodyToText(res.body);

      expect(res.ok).to.eql(true);
      expect(html).to.contain('<title>My Title</title>');

      // Finish up.
      await mock.dispose();
    });

    it('[.html] file extension (content-type: "text/html")', async () => {
      const mock = await createMock();
      const cellUri = 'cell:foo:A1';
      const client = mock.client.cell(cellUri);

      // Upload HTML file.
      const filename = 'index.html';
      const data = await readFile('src/test/assets/index.html');
      await client.files.upload({ filename, data });

      // Download the file and check headers.
      let headers: undefined | t.IHttpHeaders;
      mock.client.response$.subscribe((e) => (headers = e.response.headers));

      const res = await client.file.name(filename).download();
      const html = await bodyToText(res.body);

      expect(res.ok).to.eql(true);
      expect(headers && headers['content-type']).to.eql('text/html');
      expect(html).to.contain('<title>My Title</title>');

      // Finish up.
      await mock.dispose();
    });

    describe('download HTML and dynamically re-write relative links', () => {
      const readFiles = async () => {
        return {
          html: await readFile('src/test/assets/index.html'),
          css: await readFile('src/test/assets/style.css'),
          js: await readFile('src/test/assets/file.js'),
        };
      };

      const expectUrlsRewritten = (html: string) => {
        // Ensure absolute links remain unchanged
        expect(html).to.contain('<link rel="stylesheet" href="style.css">');
        expect(html).to.contain('<link rel="stylesheet" href="https://foo.com/style.css">');
        expect(html).to.contain('<script src="https://foo.com/file.js"></script>');

        // Ensure relative links have been updated.
        expect(html).to.contain('<script id="app" src="http://localhost:');
        expect(html).to.contain('<link id="styles" rel="stylesheet" href="http://localhost:');
      };

      it('from root: /index.html', async () => {
        const mock = await createMock();
        const cellUri = 'cell:foo:A1';
        const client = mock.client.cell(cellUri);

        // Upload HTML file.
        const files = await readFiles();
        await client.files.upload([
          { filename: 'index.html', data: files.html },
          { filename: 'assets/style.css', data: files.css },
          { filename: 'file.js', data: files.js },
        ]);

        // Download the file and check headers.
        let headers: undefined | t.IHttpHeaders;
        mock.client.response$.subscribe((e) => (headers = e.response.headers));
        const res = await client.file.name('/index.html').download();
        const html = await bodyToText(res.body);
        await mock.dispose();

        expect(headers && headers['content-type']).to.eql('text/html');
        expectUrlsRewritten(html);
      });

      it('from sub-folder: /foo/bar/index.html', async () => {
        const mock = await createMock();
        const cellUri = 'cell:foo:A1';
        const client = mock.client.cell(cellUri);

        // Upload HTML file.
        const files = await readFiles();
        await client.files.upload([
          { filename: '/foo/bar/index.html', data: files.html },
          { filename: 'foo/bar/assets/style.css', data: files.css }, // NB: alternative without root "/" (should not make a difference).
          { filename: '/foo/bar/file.js', data: files.js },
        ]);

        const res = await client.file.name('/foo/bar/index.html').download();
        const html = await bodyToText(res.body);
        await mock.dispose();

        expectUrlsRewritten(html);
      });
    });
  });
});
