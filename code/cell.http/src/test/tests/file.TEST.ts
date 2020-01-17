import { createMock, expect, fs, http, IMock, t } from '..';

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
    const res: t.IClientCellFileUpload = { filename, data };
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
    it('GET binay image file (.png)', async () => {
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
      expect(props.filename).to.eql('bird.png');
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

    it('GET file with hash query-string', async () => {
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
      expect(error.message).to.contain('does not match requested hash');
    });
  });

  describe('DELETE', () => {
    it('delete a file', async () => {
      const sourcePath = fs.resolve('src/test/assets/bird.png');
      const { mock, fileUri, file } = await testPostFile({
        source: sourcePath,
        dispose: false,
      });
      const targetPath = file?.props.location?.replace(/^file\:\/\//, '') || '';

      // Check the file exists.
      const res1 = await mock.client.file(fileUri).info();
      expect(res1.body.exists).to.eql(true);
      expect(await fs.pathExists(targetPath)).to.eql(true);

      // Delete the file.
      const res2 = await mock.client.file(fileUri).delete();

      expect(res2.ok).to.eql(true);
      expect(res2.status).to.eql(200);
      expect(res2.body.deleted).to.eql(true);
      expect(res2.body.uri).to.eql(fileUri);

      // Ensure the file has been removed from the file-system.
      expect(await fs.pathExists(targetPath)).to.eql(false);

      // Ensure the model has been deleted.
      const res3 = await mock.client.file(fileUri).info();
      expect(res3.body.exists).to.eql(false);

      // Finish up.
      await mock.dispose();
    });
  });
});
