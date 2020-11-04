import { expect, createMock, readFile } from '../../test';

const testFiles = async () => {
  const file1 = await readFile('src/test/assets/func.wasm');
  const file2 = await readFile('src/test/assets/kitten.jpg');
  const file3 = await readFile('src/test/assets/foo.json');
  return { file1, file2, file3 };
};

describe.only('cell/files: copy', () => {
  describe('errors', () => {
    it('error: SOURCE_FILENAME_EMPTY', async () => {
      const mock = await createMock();
      const A1 = 'cell:foo:A1';
      const client = mock.client.cell(A1);

      const { file3 } = await testFiles();
      await client.files.upload([{ filename: 'foo.json', data: file3 }]);

      const res = await client.files.copy({ filename: '  ', target: { uri: 'cell:foo:Z9' } });
      mock.dispose();

      expect(res.status).to.eql(500);
      expect(res.body.errors.length).to.eql(1);
      expect(res.body.errors[0].error).to.eql('SOURCE_FILENAME_EMPTY');
    });

    it('error: TARGET_URI_INVALID', async () => {
      const mock = await createMock();
      const A1 = 'cell:foo:A1';
      const client = mock.client.cell(A1);

      const { file3 } = await testFiles();
      await client.files.upload([{ filename: 'foo.json', data: file3 }]);

      const test = async (uri: string) => {
        const res = await client.files.copy({ filename: 'foo.json', target: { uri } });
        expect(res.status).to.eql(500);
        expect(res.body.errors.length).to.eql(1);
        expect(res.body.errors[0].error).to.eql('TARGET_URI_INVALID');
      };

      await test('file:foo:abc');
      await test('');
      await test('  ');
      await test('ns:foo');

      mock.dispose();
    });

    it('error: SOURCE_FILE_404', async () => {
      const mock = await createMock();
      const A1 = 'cell:foo:A1';
      const client = mock.client.cell(A1);
      const res = await client.files.copy({ filename: '404.png', target: { uri: 'cell:foo:Z9' } });
      mock.dispose();

      expect(res.status).to.eql(500);
      expect(res.body.errors.length).to.eql(1);
      expect(res.body.errors[0].error).to.eql('SOURCE_FILE_404');
    });
  });
});
