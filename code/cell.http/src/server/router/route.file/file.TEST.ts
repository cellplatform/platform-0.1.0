import { createMock, expect, FormData, fs, http, t } from '../../../test';

import { download } from '@platform/http/lib/download';

const testPost = async (args: {
  uri: string;
  filename: string;
  source?: string | string[];
  queryString?: string;
  dispose?: boolean;
}) => {
  const { uri, filename } = args;
  const mock = await createMock();
  const form = new FormData();

  // Prepare the [multipart/form-data] to post.
  if (args.source) {
    const paths = Array.isArray(args.source) ? args.source : [args.source];
    for (const path of paths) {
      const img = await fs.readFile(fs.resolve(path));
      form.append('image', img, {
        filename,
        contentType: 'application/octet-stream',
      });
    }
  }

  // POST to the service.
  let url = mock.url(uri);
  url = args.queryString ? `${url}?${args.queryString || ''}` : url;
  const headers = form.getHeaders();
  const res = await http.post(url, form, { headers });

  // Finish up.
  if (args.dispose !== false) {
    mock.dispose();
  }
  const json = res.json<t.IResPostFile>();
  const data = json.data;
  const props = (data && data.props) || {};
  return { res, json, data, props, mock };
};

describe('route: file (URI)', () => {
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
      await test('/file::123', msg);
    });
  });

  describe('GET', () => {
    it('GET binay image file (.png)', async () => {
      const uri = 'file:foo:123';
      const source = 'src/test/assets/bird.png';
      const { mock } = await testPost({
        uri,
        filename: `image.png`,
        source,
        dispose: false,
      });

      const urls = mock.urls.file(uri);
      const resDownload = await http.get(urls.download.toString());
      const resInfo = await http.get(urls.info.toString());

      expect(resDownload.status).to.eql(200);
      expect(resInfo.status).to.eql(200);

      const json = resInfo.json<t.IResGetFile>();
      const props = json.data.props;
      expect(json.uri).to.eql(uri);
      expect(props.name).to.eql('image.png');
      expect(props.mimetype).to.eql('image/png');
      expect(props.location).to.match(/^file:\/\//);

      // Download the file from the route, and ensure it saves correctly.
      const path = fs.resolve('tmp/file.png');
      await download(urls.download.toString()).save(path);
      mock.dispose();

      const file1 = await fs.readFile(source);
      const file2 = await fs.readFile(path);
      expect(file1.toString()).to.eql(file2.toString());
    });

    it('GET web-assembly file (.wasm)', async () => {
      const uri = 'file:foo:123';
      const source = 'src/test/assets/func.wasm';
      const { mock } = await testPost({
        uri,
        filename: `func.wasm`,
        source,
        dispose: false,
      });

      const urls = mock.urls.file(uri);
      const resDownload = await http.get(urls.download.toString());
      const resInfo = await http.get(urls.info.toString());

      expect(resDownload.status).to.eql(200);
      expect(resInfo.status).to.eql(200);

      const json = resInfo.json<t.IResGetFile>();
      const props = json.data.props;
      expect(json.uri).to.eql(uri);
      expect(props.name).to.eql('func.wasm');

      // Download the file from the route, and ensure it saves correctly.
      const path = fs.resolve('tmp/file.wasm');
      await download(urls.download.toString()).save(path);
      mock.dispose();

      const file1 = await fs.readFile(source);
      const file2 = await fs.readFile(path);
      expect(file1.toString()).to.eql(file2.toString());
    });

    it('GET file with hash query-string', async () => {
      const uri = 'file:foo:123';
      const source = 'src/test/assets/func.wasm';
      const { mock } = await testPost({
        uri,
        filename: `func.wasm`,
        source,
        dispose: false,
      });

      const urls = mock.urls.file(uri);
      const info = (await http.get(urls.info.toString())).json<t.IResGetFile>();
      const hash = info.data.hash;

      const res1 = await http.get(urls.download.query({ hash }).toString());
      const res2 = await http.get(urls.download.query({ hash: '123' }).toString());
      mock.dispose();

      expect(res1.status).to.eql(200);
      expect(res2.status).to.eql(409);

      const error = res2.json<t.IHttpError>();
      expect(error.status).to.eql(409);
      expect(error.type).to.eql('HTTP/hash/mismatch');
      expect(error.message).to.contain('does not match requested hash');
    });
  });

  describe('POST', () => {
    it('POST single file', async () => {
      const sourcePath = fs.resolve('src/test/assets/bird.png');
      const savePath = fs.resolve('tmp/fs/ns.foo/123');
      await fs.remove(savePath);

      const uri = 'file:foo:123';
      const { res, json, data, props } = await testPost({
        uri,
        filename: `image.png`,
        source: sourcePath,
      });

      expect(res.status).to.eql(200);
      expect(json.uri).to.eql(uri);
      expect(json.changes && json.changes.length).to.eql(3); // Changes returned by default.

      expect(data.hash).to.match(/^sha256-[0-9a-z]+/);
      expect(props.filehash).to.match(/^sha256-[0-9a-z]+/);
      expect(data.hash).to.not.eql(props.filehash); // Hash of model is different from raw file-data hash.

      // Ensure saved file matches POST'ed file.
      const sourceFile = await fs.readFile(sourcePath);
      const savedFile = await fs.readFile(savePath);
      expect(sourceFile.toString()).to.eql(savedFile.toString());
    });

    it('POST no changes returned (via query-string flag)', async () => {
      const { json } = await testPost({
        uri: 'file:foo:123',
        filename: `image.png`,
        source: 'src/test/assets/bird.png',
        queryString: 'changes=false',
      });
      expect(json.changes).to.eql(undefined);
    });

    describe('errors', () => {
      it('throws if no file posted', async () => {
        const { res } = await testPost({
          uri: 'file:foo:123',
          filename: `image.png`,
        });
        expect(res.status).to.eql(400);

        const error = res.json<t.IHttpError>();
        expect(error.status).to.eql(400);
        expect(error.type).to.eql('HTTP/server');
        expect(error.message).to.contain('No file data was posted');
      });

      it('throws if no file posted', async () => {
        const { res } = await testPost({
          uri: 'file:foo:123',
          filename: `image.png`,
          source: ['src/test/assets/bird.png', 'src/test/assets/kitten.jpg'],
        });
        expect(res.status).to.eql(400);

        const error = res.json<t.IHttpError>();
        expect(error.status).to.eql(400);
        expect(error.type).to.eql('HTTP/server');
        expect(error.message).to.contain('Only a single file can be posted');
      });
    });
  });
});
