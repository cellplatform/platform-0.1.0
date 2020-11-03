import { expect, fs, HttpClient, log, t } from '../../test';

const HOST = 'http://localhost:8080';
const CELL = 'cell:ckh19y2lf000003et6d5farp0:A1';

describe('Client (Integration)', function () {
  this.timeout(99999);

  describe('upload', () => {
    const client = HttpClient.create(HOST);
    const cell = client.cell(CELL);

    const testFile = async (filename: string) => {
      const data = await fs.readFile(fs.resolve('./package.json'));
      const upload: t.IHttpClientCellFileUpload = { filename, data };
      return { filename, upload };
    };

    it('permission: "private" (default)', async () => {
      const { filename, upload } = await testFile('foo/private.json');
      const res = await cell.files.upload(upload);
      expect(res.status).to.eql(200);

      const info = await cell.info();
      log.info.green(info.body.urls.files);

      const fileInfo = await cell.file.name(filename).info();
      expect(fileInfo.body.data.props['s3:permission']).to.eql('private');
    });

    it('permission: "public-read" (default)', async () => {
      const { filename, upload } = await testFile('foo/public.json');
      const res = await cell.files.upload(upload, { permission: 'public-read' });
      expect(res.status).to.eql(200);

      const fileInfo = await cell.file.name(filename).info();
      expect(fileInfo.body.data.props['s3:permission']).to.eql('public-read');
    });
  });
});
