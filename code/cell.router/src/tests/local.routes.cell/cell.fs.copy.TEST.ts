import { createMock, expect, fs, testFiles } from '../../test';

const tmp = fs.resolve(`./tmp/download`);
const A1 = 'cell:foo:A1';
const Z9 = 'cell:foo:Z9';

describe('cell.fs: copy', () => {
  describe('copy', () => {
    it('copy single file', async () => {
      const mock = await createMock();
      const source = mock.client.cell(A1);
      const target = mock.client.cell(Z9);

      const { file1 } = await testFiles();
      const filename = 'foo.png';
      await source.fs.upload([{ filename, data: file1 }]);

      const res = await source.fs.copy({ filename, target: { uri: Z9 } });
      expect(res.status).to.eql(200);

      await fs.stream.save(tmp, (await target.file.name(filename).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file1.toString());

      expect(res.body.files.length).to.eql(1);
      expect(res.body.errors).to.eql([]);
      expect(res.body.changes).to.eql([]);

      const file = res.body.files[0];

      expect(file.source.host).to.eql(mock.host);
      expect(file.source.filename).to.eql(filename);
      expect(file.source.cell).to.eql(A1);
      expect(file.source.status).to.eql('EXISTING');
      expect(file.source.file).to.match(/^file\:foo\:/);
      expect(file.target.status).to.eql('NEW');

      mock.dispose();
    });

    it('copy to different filename', async () => {
      const mock = await createMock();
      const source = mock.client.cell(A1);
      const target = mock.client.cell(Z9);

      const filename1 = 'foo.png';
      const filename2 = '0.1.2/foo.png';

      const { file1 } = await testFiles();
      await source.fs.upload([{ filename: filename1, data: file1 }]);

      const res = await source.fs.copy({
        filename: filename1,
        target: { uri: Z9, filename: filename2 },
      });
      expect(res.status).to.eql(200);

      await fs.stream.save(tmp, (await target.file.name(filename2).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file1.toString());

      mock.dispose();
    });

    it('copy multiple files (array)', async () => {
      const mock = await createMock();
      const source = mock.client.cell(A1);
      const target = mock.client.cell(Z9);

      const { file1, file2 } = await testFiles();
      const filename1 = 'foo.png';
      const filename2 = 'bar.png';
      await source.fs.upload([
        { filename: filename1, data: file1 },
        { filename: filename2, data: file2 },
      ]);

      expect(await target.file.name(filename1).exists()).to.eql(false);
      expect(await target.file.name(filename2).exists()).to.eql(false);

      const res = await source.fs.copy([
        { filename: filename1, target: { uri: Z9 } },
        { filename: filename2, target: { uri: Z9 } },
      ]);
      expect(res.status).to.eql(200);
      expect(res.body.changes).to.eql([]); // NB: Flag to return changes not set.
      expect(res.body.files.length).to.eql(2);

      expect(await target.file.name(filename1).exists()).to.eql(true);
      expect(await target.file.name(filename2).exists()).to.eql(true);

      await fs.stream.save(tmp, (await target.file.name(filename1).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file1.toString());

      await fs.stream.save(tmp, (await target.file.name(filename2).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file2.toString());

      mock.dispose();
    });

    it('copy over existing file', async () => {
      const mock = await createMock();
      const source = mock.client.cell(A1);
      const target = mock.client.cell(Z9);

      const { file1, file2 } = await testFiles();
      const filename1 = 'foo.png';
      const filename2 = 'bar.png';
      await source.fs.upload([
        { filename: filename1, data: file1 },
        { filename: filename2, data: file2 },
      ]);

      const res1 = await source.fs.copy({
        filename: filename1,
        target: { uri: Z9 },
      });

      expect(res1.body.files[0].source.status).to.eql('EXISTING');
      expect(res1.body.files[0].target.status).to.eql('NEW');

      await fs.stream.save(tmp, (await source.file.name(filename1).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file1.toString());

      const res2 = await source.fs.copy({
        filename: filename2,
        target: { uri: Z9, filename: filename1 },
      });

      expect(res2.body.files[0].source.status).to.eql('EXISTING');
      expect(res2.body.files[0].target.status).to.eql('EXISTING');

      await fs.stream.save(tmp, (await target.file.name(filename1).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file2.toString());

      mock.dispose();
    });

    it('copy within single cell', async () => {
      const mock = await createMock();
      const source = mock.client.cell(A1);

      const { file1 } = await testFiles();
      const filename1 = 'foo.png';
      const filename2 = 'bar.png';
      await source.fs.upload([{ filename: filename1, data: file1 }]);

      expect(await source.file.name(filename2).exists()).to.eql(false);

      const res = await source.fs.copy({
        filename: filename1,
        target: { uri: A1, filename: filename2 },
      });

      expect(res.body.files[0].source.status).to.eql('EXISTING');
      expect(res.body.files[0].target.status).to.eql('NEW');

      expect(await source.file.name(filename2).exists()).to.eql(true);

      await fs.stream.save(tmp, (await source.file.name(filename1).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file1.toString());

      await fs.stream.save(tmp, (await source.file.name(filename2).download()).body);
      expect((await fs.readFile(tmp)).toString()).to.eql(file1.toString());

      mock.dispose();
    });

    it('copy between hosts', async () => {
      const mock1 = await createMock();
      const mock2 = await createMock();
      const source = mock1.client.cell(A1);
      const target = mock2.client.cell(A1);

      const { file1 } = await testFiles();
      const filename = 'foo.png';
      await source.fs.upload([{ filename: filename, data: file1 }]);

      expect(await target.file.name(filename).exists()).to.eql(false);

      await source.fs.copy({
        filename: filename,
        target: { uri: A1, host: mock2.host },
      });

      expect(await target.file.name(filename).exists()).to.eql(true);

      mock1.dispose();
      mock2.dispose();
    });

    it('returns changes', async () => {
      const mock = await createMock();
      const source = mock.client.cell(A1);

      const { file1 } = await testFiles();
      const filename = 'foo.png';
      await source.fs.upload([{ filename, data: file1 }]);

      const res = await source.fs.copy(
        { filename: 'foo.png', target: { uri: Z9 } },
        { changes: true },
      );

      mock.dispose();
      expect(res.status).to.eql(200);
      expect(res.body.changes?.length).to.greaterThan(2);
    });
  });

  describe('errors', () => {
    it('error: invalid target cell URI', async () => {
      const mock = await createMock();
      const A1 = 'cell:foo:A1';
      const client = mock.client.cell(A1);

      const { file3 } = await testFiles();
      await client.fs.upload([{ filename: 'foo.png', data: file3 }]);

      const test = async (uri: string) => {
        const res = await client.fs.copy({ filename: 'foo.png', target: { uri } });
        expect(res.status).to.eql(500);
        expect(res.body.errors[0].message).to.include('the target cell to copy to is invalid');
      };

      await test('file:foo:abc');
      await test('');
      await test('  ');
      await test('ns:foo');

      mock.dispose();
    });

    it('error: file does not exist', async () => {
      const mock = await createMock();
      const A1 = 'cell:foo:A1';
      const client = mock.client.cell(A1);
      const res = await client.fs.copy({ filename: '404.png', target: { uri: 'cell:foo:Z9' } });
      mock.dispose();

      expect(res.status).to.eql(500);
      expect(res.body.errors.length).to.eql(1);

      const error = res.body.errors[0].message;
      expect(error).to.include("The filename/path '404.png' does not exist");
    });

    it('error: empty filename', async () => {
      const mock = await createMock();
      const A1 = 'cell:foo:A1';
      const client = mock.client.cell(A1);

      const { file3 } = await testFiles();
      await client.fs.upload([{ filename: 'foo.png', data: file3 }]);

      const res = await client.fs.copy({ filename: '  ', target: { uri: 'cell:foo:Z9' } });
      mock.dispose();

      expect(res.status).to.eql(500);
      expect(res.body.errors.length).to.eql(1);

      const error = res.body.errors[0].message;
      expect(error).to.include('filename was not provided');
    });
  });
});
