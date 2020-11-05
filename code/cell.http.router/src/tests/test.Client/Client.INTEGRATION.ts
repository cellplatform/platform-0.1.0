import { expect, fs, HttpClient, log, t, Uri } from '../../test';

const HOST = 'http://localhost:8080';

const testFile = async (filename: string) => {
  const data = await fs.readFile(fs.resolve('./package.json'));
  const upload: t.IHttpClientCellFileUpload = { filename, data };
  return { filename, upload };
};

describe('Client (Integration)', function () {
  this.timeout(99999);

  describe('upload', () => {
    const client = HttpClient.create(HOST);
    const cell = client.cell('cell:ckh19y2lf000003et6d5farp0:A1');

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

  describe.only('copy', () => {
    const client = HttpClient.create(HOST);
    const CELL = {
      SOURCE: 'cell:ckh2kf0ht0000k9et414zcopy:A1',
      TARGET: 'cell:ckh2kfrqb0000lcetamvycopy:Z9',
      // TARGET: 'file:ckh2kfrqb0000lcetamvycopy:Z9',
    };

    it('single', async () => {
      const source = client.cell(CELL.SOURCE);

      const { filename, upload } = await testFile('file.json');
      // await source.files.upload(upload);

      const res = await source.files.copy({ filename: 'file.json', target: { uri: CELL.TARGET } });
      // const res = await source.files.copy({ filename: '  ', target: { uri: CELL.TARGET } });

      console.log('-------------------------------------------');
      console.log('res.status', res.status);
      console.log('res', res.body);
      console.log('res.error', res.error);
      // console.log('id.cuid()', id.cuid());
      // console.log('cell', CELL);
    });
  });
});
