import { expect, fs, HttpClient, log, slug, t } from '../../test';

const HOST1 = 'http://localhost:8080';
const HOST2 = 'http://localhost:5000';

const testFile = async (filename: string, fileData: t.Json) => {
  const path = fs.resolve('./tmp/testfile.json');
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, JSON.stringify(fileData, null, '  '));
  const data = await fs.readFile(path);
  const upload: t.IHttpClientCellFileUpload = { filename, data };
  return { filename, upload, data };
};

describe('Client (Integration)', function () {
  this.timeout(99999);

  describe('upload', () => {
    const client = HttpClient.create(HOST1);
    const cell = client.cell('cell:ckh19y2lf000003et6d5farp0:A1');

    it('permission: "private" (default)', async () => {
      const { filename, upload } = await testFile('foo/private.json', { foo: 123 });
      const res = await cell.files.upload(upload);
      expect(res.status).to.eql(200);

      const info = await cell.info();
      log.info.green(info.body.urls.files);

      const fileInfo = await cell.file.name(filename).info();
      expect(fileInfo.body.data.props['s3:permission']).to.eql('private');
    });

    it('permission: "public-read" (default)', async () => {
      const { filename, upload } = await testFile('foo/public.json', { foo: 123 });
      const res = await cell.files.upload(upload, { permission: 'public-read' });
      expect(res.status).to.eql(200);

      const fileInfo = await cell.file.name(filename).info();
      expect(fileInfo.body.data.props['s3:permission']).to.eql('public-read');
    });
  });

  describe('copy', () => {
    const client = HttpClient.create(HOST1);
    const CELL = {
      SOURCE: 'cell:ckh2kf0ht0000k9et414zCopy:A1',
      TARGET: 'cell:ckh2kfrqb0000lcetamvyCopy:Z9',
    };

    it('copy: to different cell changing filename and permission', async () => {
      const source = client.cell(CELL.SOURCE);
      const target = client.cell(CELL.TARGET);

      const filename1 = `copy/file-${slug()}.json`;
      const filename2 = `copy/file-${slug()}.json`;

      const { upload } = await testFile(filename1, { foo: 123 });
      await source.files.upload(upload);

      const file1 = await source.file.name(filename1).info();
      expect(file1.ok).to.eql(true);
      expect(file1.body.data.props['s3:permission']).to.eql('private');

      const res = await source.files.copy(
        {
          filename: filename1,
          target: { uri: CELL.TARGET, filename: filename2 },
        },
        { permission: 'public-read', changes: true },
      );

      expect(res.status).to.eql(200);
      expect(res.body.files.length).to.eql(1);
      expect(res.body.files[0].source.filename).to.eql(filename1);
      expect(res.body.files[0].target.filename).to.eql(filename2);
      expect(res.body.files[0].source.status).to.eql('EXISTING');
      expect(res.body.files[0].target.status).to.eql('NEW');
      expect(res.body.changes?.length).to.greaterThan(1);

      const file2 = await target.file.name(filename2).info();
      expect(file2.status).to.eql(200);
      expect(file2.body.data.props['s3:permission']).to.eql('public-read');
    });

    it('copy: different cell overwrite existing file', async () => {
      const source = client.cell(CELL.SOURCE);
      const target = client.cell(CELL.TARGET);

      const tmp = fs.resolve(`./tmp/download`);
      const filename1 = `copy/file-${slug()}.json`;
      const filename2 = `copy/file-${slug()}.json`;

      const file1 = await testFile(filename1, { foo: 1 });
      const file2 = await testFile(filename2, { foo: 2 });
      await source.files.upload([file1.upload, file2.upload]);

      const res1 = await source.files.copy({
        filename: filename1,
        target: { uri: CELL.TARGET },
      });

      expect(res1.body.files[0].source.status).to.eql('EXISTING');
      expect(res1.body.files[0].target.status).to.eql('NEW');

      await fs.stream.save(tmp, (await target.file.name(filename1).download()).body);
      expect(await fs.readJson(tmp)).to.eql({ foo: 1 });

      const res2 = await source.files.copy({
        filename: filename2,
        target: { uri: CELL.TARGET, filename: filename1 },
      });

      expect(res2.body.files.length).to.eql(1);
      expect(res2.body.files[0].source.status).to.eql('EXISTING');
      expect(res2.body.files[0].target.status).to.eql('EXISTING');

      await fs.stream.save(tmp, (await target.file.name(filename1).download()).body);
      expect(await fs.readJson(tmp)).to.eql({ foo: 2 });
    });

    it('copy: within single cell', async () => {
      const source = client.cell(CELL.SOURCE);

      const tmp = fs.resolve(`./tmp/download`);
      const filename1 = `copy/file-${slug()}.json`;
      const filename2 = `copy/file-${slug()}.json`;

      const file = await testFile(filename1, { foo: 'hello' });
      await source.files.upload([file.upload]);

      expect((await source.file.name(filename2).info()).status).to.eql(404);

      const res = await source.files.copy({
        filename: filename1,
        target: { uri: CELL.SOURCE, filename: filename2 },
      });

      expect(res.body.files[0].source.status).to.eql('EXISTING');
      expect(res.body.files[0].target.status).to.eql('NEW');

      expect((await source.file.name(filename2).info()).status).to.eql(200);

      await fs.stream.save(tmp, (await source.file.name(filename1).download()).body);
      expect(await fs.readJson(tmp)).to.eql({ foo: 'hello' });

      await fs.stream.save(tmp, (await source.file.name(filename2).download()).body);
      expect(await fs.readJson(tmp)).to.eql({ foo: 'hello' });
    });

    it('copy: between hosts', async () => {
      const source = client.cell(CELL.SOURCE);
      const target = HttpClient.create(HOST2).cell(CELL.SOURCE);

      const tmp = fs.resolve(`./tmp/download`);
      const filename = `copy/file-${slug()}.json`;

      const file = await testFile(filename, { foo: 123 });
      await source.files.upload([file.upload]);

      expect((await target.file.name(filename).info()).status).to.eql(404);

      await source.files.copy({
        filename: filename,
        target: { uri: CELL.SOURCE, host: HOST2 },
      });

      expect((await target.file.name(filename).info()).status).to.eql(200);

      await fs.stream.save(tmp, (await target.file.name(filename).download()).body);
      expect(await fs.readJson(tmp)).to.eql({ foo: 123 });
    });

    it('copy: multiple files', async () => {
      const source = client.cell(CELL.SOURCE);
      const target = client.cell(CELL.TARGET);

      const tmp = fs.resolve(`./tmp/download`);
      const filename1 = `copy/file-${slug()}.json`;
      const filename2 = `copy/file-${slug()}.json`;

      const file1 = await testFile(filename1, { foo: 1 });
      const file2 = await testFile(filename2, { foo: 2 });
      await source.files.upload([file1.upload, file2.upload]);

      expect((await target.file.name(filename1).info()).status).to.eql(404);
      expect((await target.file.name(filename2).info()).status).to.eql(404);

      await source.files.copy([
        {
          filename: filename1,
          target: { uri: CELL.TARGET },
        },
        {
          filename: filename2,
          target: { uri: CELL.TARGET },
        },
      ]);

      await fs.stream.save(tmp, (await target.file.name(filename1).download()).body);
      expect(await fs.readJson(tmp)).to.eql({ foo: 1 });

      expect((await target.file.name(filename1).info()).status).to.eql(200);
      expect((await target.file.name(filename2).info()).status).to.eql(200);
    });
  });
});
