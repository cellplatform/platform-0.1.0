import { createMock, expect, fs, http, readFile, Schema, t } from '..';

const expectFileInFs = async (fileUri: string, exists: boolean) => {
  const { file, ns } = Schema.uri.parse<t.IFileUri>(fileUri).parts;
  const path = fs.resolve(`tmp/fs/ns.${ns}/${file}`);
  expect(await fs.pathExists(path)).to.eql(exists);
};

describe.only('uploading files to cell', () => {
  it('upload files by name (updating the cell model)', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const cellClient = mock.client.cell(cellUri);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');

    // Cell model does not exist.
    const res1 = (await http.get(mock.url(cellUri))).json as t.IResGetCell;
    expect(res1.exists).to.eql(false);
    expect(res1.data).to.eql({});

    // Upload two files.
    const res2 = await cellClient.files.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
    ]);

    (() => {
      expect(res2.status).to.eql(200);
      const data = res2.body.data;
      const cell = data.cell;
      const links = cell.links || {};
      expect(links['fs:func:wasm']).to.match(/^file\:foo/);
      expect(links['fs:kitten:jpg']).to.match(/^file\:foo/);

      const filenames = data.files.map(file => file.after?.props.filename);
      expect(filenames).to.include('func.wasm');
      expect(filenames).to.include('kitten.jpg');
    })();

    // Compare the cell in the response with a new query to the cell from the service.
    expect((await cellClient.info()).body.data).to.eql(res2.body.data.cell);

    // Ensure the file location has been stored.
    await (async () => {
      const files = (await cellClient.files.list()).body;
      expect(files.length).to.eql(2);
      expect(files.every(f => f.props.location?.startsWith('file:///'))).to.eql(true);
    })();

    // Check the files exist.
    const downloadAndSave = async (filename: string, path: string, compareWith: Buffer) => {
      path = fs.resolve(path);
      const client = cellClient.file.name(filename);
      const res = await client.download();
      await fs.stream.save(path, res.body);
      const buffer = await readFile(path);
      expect(buffer.toString()).to.eql(compareWith.toString());
    };
    await downloadAndSave('func.wasm', 'tmp/file1', file1);
    await downloadAndSave('kitten.jpg', 'tmp/file2', file2);

    // Examine changes.
    const changes = res2.body.data.changes || [];
    expect(changes[0].uri).to.eql(cellUri);
    expect(changes[0].field).to.eql('links');
    expect(changes[0].from).to.eql(undefined);

    // Finish up.
    await mock.dispose();
  });

  it.only('uploads file, stores upload time and filehash (sha256) from client', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    const file = await readFile('src/test/assets/func.wasm');
    const res = await client.files.upload([{ filename: 'func.wasm', data: file }]);

    // Ensure before/after state of the uploaded file.
    await (async () => {
      const file = res.body.data.files[0];
      const before = file.before;
      const after = file.after;

      expect(before.hash).to.not.eql(after?.hash);

      // Before.
      expect(before.props.integrity?.status).to.eql('UPLOADING');
      expect(before.props.integrity?.uploadedAt).to.eql(undefined);

      // After.
      expect(after?.props.integrity?.status).to.eql('UNKNOWN');
      expect(after?.props.integrity?.uploadedAt).to.be.a('number');

      // const res1 = (await cellClient.file.name('func.wasm').info()).body.data;
      // console.log('res1', res1);

      console.log('-------------------------------------------');
      console.log('file.uri', file.uri);
      console.log('after', after);
    })();

    // Finish up.
    await mock.dispose();
  });

  /**
   * TODO 🐷
   * - file upload hash integrity
   * - pass filehash (sha256) in upload body
   * - fix all tests
   * - verify endpoint (download) - different URL to "complete upload" endpoint.
   *
   */

  it.skip('downloads a file by name (failing if the underlying file-hash changes)', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const cellClient = mock.client.cell(cellUri);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');

    // POST the file to the service.
    await cellClient.files.upload({ filename: 'func.wasm', data: file1 });

    // Save and compare the downloaded stream.
    const path = fs.resolve('tmp/test/download/func.wasm');
    const res = await cellClient.file.name('func.wasm').download();
    if (res.body) {
      await fs.stream.save(path, res.body);
    }
    expect((await readFile(path)).toString()).to.eql(file1.toString());

    const links = (await cellClient.links()).body;

    // Upload the same image, hashes should not change.
    const before1 = (await links.files[0].file.info()).body;
    await cellClient.files.upload({ filename: 'func.wasm', data: file1 });
    const after1 = (await links.files[0].file.info()).body;
    expect(before1.data.hash).to.eql(after1.data.hash);

    // Perform a download - should work find (because hashes still match).
    const download1 = await cellClient.file.name('func.wasm').download();
    expect(download1.status).to.eql(200);

    // Upload a different image, with the same name.
    // Hash should change.
    const before2 = (await links.files[0].file.info()).body;
    await cellClient.files.upload({ filename: 'func.wasm', data: file2 });
    const after2 = (await links.files[0].file.info()).body;
    expect(before2.data.hash).to.not.eql(after2.data.hash);

    // Attempt to download the image from the cell.
    // ERROR should happen because of hash-mismatch.
    const download2 = await cellClient.file.name('func.wasm').download();
    expect(download2.ok).to.eql(false);
    expect(download2.status).to.eql(409);
    expect(download2.error && download2.error.message).to.contains('hash does not match');

    // Get info about the file, from the `file.name` client.
    const fileInfo = await cellClient.file.name('func.wasm').info();
    expect(fileInfo.status).to.eql(200);
    expect(fileInfo.body.data.props.filename).to.eql('func.wasm');

    // Finish up.
    await mock.dispose();
  });

  it('GET A1/files', async () => {
    const mock = await createMock();
    const A1 = 'cell:foo!A1';
    const A2 = 'cell:foo!A2';
    const clientA1 = mock.client.cell(A1);
    const clientA2 = mock.client.cell(A2);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');
    const file3 = await readFile('src/test/assets/bird.png');

    // POST the file to the service.
    await clientA1.files.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
    ]);
    await clientA2.files.upload({ filename: 'bird.png', data: file3 });

    const res1 = await clientA1.files.list();
    const res2 = await clientA2.files.list();

    expect(res1.body.length).to.eql(2);
    expect(res1.body[0].props.filename).to.eql('func.wasm');
    expect(res1.body[1].props.filename).to.eql('kitten.jpg');

    expect(res2.body.length).to.eql(1);
    expect(res2.body[0].props.filename).to.eql('bird.png');

    // Finish up.
    await mock.dispose();
  });

  it('DELETE A1/files (delete and/or unlink)', async () => {
    const mock = await createMock();
    const A1 = 'cell:foo!A1';
    const clientA1 = mock.client.cell(A1);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');
    const file3 = await readFile('src/test/assets/bird.png');
    const file4 = await readFile('src/test/assets/foo.json');

    await clientA1.files.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
      { filename: 'cat&bird.png', data: file3 },
      { filename: 'foo.json', data: file4 },
    ]);

    const res1 = await clientA1.files.list();
    expect(res1.body.length).to.eql(4);

    await expectFileInFs(res1.body[0].uri, true);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, true);
    await expectFileInFs(res1.body[3].uri, true);

    const res2 = await clientA1.files.delete(['', '  ']); // NB: All values collapse to nothing.
    expect(res2.status).to.eql(200);
    expect(res2.body.deleted).to.eql([]);
    expect(res2.body.unlinked).to.eql([]);
    expect(res2.body.errors).to.eql([]);

    // Delete single file.
    const res3 = await clientA1.files.delete('cat&bird.png');
    expect(res3.ok).to.eql(true);
    expect(res3.status).to.eql(200);
    expect(res3.body.uri).to.eql('cell:foo!A1');
    expect(res3.body.deleted).to.eql(['cat&bird.png']);
    expect(res3.body.unlinked).to.eql(['cat&bird.png']);
    expect(res3.body.errors).to.eql([]);

    // Ensure files have been deleted from the underlying file-system.
    await expectFileInFs(res1.body[0].uri, true);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, false);
    await expectFileInFs(res1.body[3].uri, true);
    expect((await clientA1.files.list()).body.length).to.eql(3);

    // Ensure the links is removed from the cell.
    const links = (await clientA1.info()).body.data.links || {};
    expect(links['fs:cat&bird:png']).to.eql(undefined); //   Unlinked and deleted.
    expect(links['fs:func:wasm']).to.not.eql(undefined); //  Remains.
    expect(links['fs:kitten:jpg']).to.not.eql(undefined); // Remains.

    // Remove multiple-files at once.
    const res4 = await clientA1.files.delete(['func.wasm', 'foo.json']);
    expect(res4.body.deleted.sort()).to.eql(['foo.json', 'func.wasm']);
    expect(res4.body.unlinked.sort()).to.eql(['foo.json', 'func.wasm']);
    expect(res4.body.errors).to.eql([]);

    // Ensure files have been deleted from the underlying file-system.
    await expectFileInFs(res1.body[0].uri, false);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, false);
    await expectFileInFs(res1.body[3].uri, false);
    expect((await clientA1.files.list()).body.length).to.eql(1);

    // Report error for a delete request that is not linked to the cell.
    const res5 = await clientA1.files.delete('not-linked.pdf');
    expect(res5.ok).to.eql(false);
    expect(res5.status).to.eql(500);
    expect(res5.body.errors.length).to.eql(1);
    expect(res5.body.errors[0].error).to.eql('NOT_LINKED');

    // Unlink only.
    const res6 = await clientA1.files.unlink('kitten.jpg');
    expect(res6.body.deleted).to.eql([]);
    expect(res6.body.unlinked).to.eql(['kitten.jpg']);
    expect(res6.body.errors).to.eql([]);

    // Ensure file remains on file-system, but is not linked to the cell model.
    await expectFileInFs(res1.body[0].uri, false);
    await expectFileInFs(res1.body[1].uri, true);
    await expectFileInFs(res1.body[2].uri, false);
    await expectFileInFs(res1.body[3].uri, false);
    expect((await clientA1.files.list()).body.length).to.eql(0);

    // Finish up.
    await mock.dispose();
  });
});
