import { createMock, expect, fs, http, IMock, t, id, Schema } from '../test';

export const testPostFile = async (args: {
  source?: string | string[];
  queryString?: string;
  dispose?: boolean;
  mock?: IMock;
  cellUri?: string;
}) => {
  const mock = args.mock || (await createMock());

  const cellUri = args.cellUri || 'cell:foo!A1';
  const client = mock.client.cell(cellUri);
  const paths = (Array.isArray(args.source)
    ? args.source
    : [args.source].filter(m => Boolean(m))) as string[];

  const wait = paths.map(async path => {
    const filename = fs.basename(path);
    const data = await fs.readFile(fs.resolve(path));
    const res: t.IHttpClientCellFileUpload = { filename, data };
    return res;
  });
  const files = await Promise.all(wait);
  const res = await client.files.upload(files);

  // Finish up.
  if (args.dispose !== false) {
    mock.dispose();
  }

  const file = res.body.files[0];
  const fileUri = file.uri;

  return { res, mock, cellUri, fileUri, file: file.data };
};

describe('file:', () => {
  describe('invalid URI', () => {
    const test = async (path: string, expected: string) => {
      const mock = await createMock();
      const url = mock.url(path);
      const res = await http.get(url);
      await mock.dispose();

      const body = res.json as any;

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
    it('does not exist (404)', async () => {
      const mock = await createMock();

      const uri = Schema.uri.create.file(Schema.cuid(), Schema.slug());
      const res = await mock.client.file(uri).info();
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);
      expect(res.body.exists).to.eql(false);
      expect(res.body.uri).to.eql(uri);
      expect(res.error).to.eql(undefined);
    });

    it('binay image file (.png)', async () => {
      const source = 'src/test/assets/bird.png';
      const { mock, fileUri } = await testPostFile({
        source,
        dispose: false,
      });

      const urls = mock.urls.file(fileUri);
      const resDownload = await http.get(urls.download.toString());
      const resInfo = await http.get(urls.info.toString());

      expect(resDownload.status).to.eql(200);
      expect(resInfo.status).to.eql(200);

      const json = resInfo.json as t.IResGetFile;
      const props = json.data.props;

      expect(json.uri).to.eql(fileUri);
      expect(props.mimetype).to.eql('image/png');
      expect(props.location).to.match(/^file:\/\//);

      // Download the file from the route, and ensure it saves correctly.
      const path = fs.resolve('tmp/file.png');
      if (resDownload.body) {
        await fs.stream.save(path, resDownload.body);
      }

      mock.dispose();

      const file1 = await fs.readFile(source);
      const file2 = await fs.readFile(path);
      expect(file1.toString()).to.eql(file2.toString());
    });

    it('file with hash query-string', async () => {
      const source = 'src/test/assets/func.wasm';
      const { mock, fileUri } = await testPostFile({
        source,
        dispose: false,
      });

      const urls = mock.urls.file(fileUri);
      const info = (await http.get(urls.info.toString())).json as t.IResGetFile;
      const hash = info.data.hash;

      const res1 = await http.get(urls.download.query({ hash }).toString());
      const res2 = await http.get(urls.download.query({ hash: 'sha256-abc' }).toString());
      mock.dispose();

      expect(res1.status).to.eql(200);
      expect(res2.status).to.eql(409);

      const error = res2.json as t.IHttpError;
      expect(error.status).to.eql(409);
      expect(error.type).to.eql('HTTP/hash/mismatch');
      expect(error.message).to.contain('does not match the stored file');
    });
  });
});
