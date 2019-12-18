import { Schema, createMock, expect, fs, http, t } from '../../../test';

describe('route: !A1/file', () => {
  it.skip('TEMP ||| writes file by name (updating the cell model)', async () => {
    // TEMP - DELETE 🐷
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';

    // Cell model does not exist.
    const res1 = (await http.get(mock.url(cellUri))).json as t.IResGetCell;
    expect(res1.exists).to.eql(false);
    expect(res1.data).to.eql({});

    // POST the file to the service.
    const sourceFile = await fs.readFile(fs.resolve('src/test/assets/func.wasm'));
    const client = mock.client.cell(cellUri);
    const res2 = await client.file.name('func.wasm').upload(sourceFile);

    // Ensure the URI to the file was stored.
    const cell = res2.body.data.cell;
    const link = (cell.links || {})['fs:func:wasm'];
    const uri = Schema.uri.parse<t.IFileUri>(link);
    expect(uri.ok).to.eql(true);

    // Load the file info and compare filename and hash.
    const res3 = await http.get(mock.urls.file(link.split('?')[0]).info.toString());
    const res3Data = (res3.json as t.IResGetFile).data;
    const fileHash = res3Data.hash;
    expect(link.split('?')[1]).to.eql(`hash=${fileHash}`);
    expect(res3Data.props.filename).to.eql('func.wasm');

    // Load the saved file and ensure it matches the source.
    const targetFilePath = fs.resolve(`tmp/fs/ns.${uri.parts.ns}/${uri.parts.file}`);
    const targetFile = await fs.readFile(targetFilePath);

    expect(targetFile.toString()).to.eql(sourceFile.toString());

    // Examine changes.
    const changes = res2.body.data.changes || [];
    expect(changes[0].uri).to.eql(cellUri);
    expect(changes[0].field).to.eql('links');
    expect(changes[0].from).to.eql(undefined);
    expect(changes[0].to).to.eql({ 'fs:func:wasm': link });

    await mock.dispose();
  });

  it('writes files by name (updating the cell model)', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const cellClient = mock.client.cell(cellUri);

    const file1 = await fs.readFile(fs.resolve('src/test/assets/func.wasm'));
    const file2 = await fs.readFile(fs.resolve('src/test/assets/kitten.jpg'));

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
      const cell = res2.body.data.cell;
      const links = cell.links || {};
      expect(links['fs:func:wasm']).to.match(/^file\:foo/);
      expect(links['fs:kitten:jpg']).to.match(/^file\:foo/);
    })();

    // Compare the cell in the response with a new query to the cell from the service.
    expect((await cellClient.info()).body.data).to.eql(res2.body.data.cell);

    // Check the files exist.
    const downloadAndSave = async (filename: string, path: string, compareWith: Buffer) => {
      path = fs.resolve(path);
      const res = await cellClient.file.name(filename).download();
      await fs.stream.save(path, res.body);
      const buffer = await fs.readFile(path);
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

  it('downloads a file by name (failing if the underlying file-hash changes)', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const cellClient = mock.client.cell(cellUri);

    const file1 = await fs.readFile(fs.resolve('src/test/assets/func.wasm'));
    const file2 = await fs.readFile(fs.resolve('src/test/assets/kitten.jpg'));

    // POST the file to the service.
    await cellClient.file.name('func.wasm').upload(file1);

    // Save and compare the downloaded stream.
    const path = fs.resolve('tmp/test/download/func.wasm');
    const res = await cellClient.file.name('func.wasm').download();
    if (res.body) {
      await fs.stream.save(path, res.body);
    }
    expect((await fs.readFile(path)).toString()).to.eql(file1.toString());

    const links = (await cellClient.links()).body;
    const fileUri = links.files[0].uri;

    // Upload the same image, hashes should not change.
    const before1 = (await links.files[0].file.info()).body;
    await mock.client.file(fileUri).upload({ filename: 'func.wasm', data: file1 });
    const after1 = (await links.files[0].file.info()).body;
    expect(before1.data.hash).to.eql(after1.data.hash);

    // Perform a download - should work find (because hashes still match).
    const download1 = await cellClient.file.name('func.wasm').download();
    expect(download1.status).to.eql(200);

    // Upload a different image, with the same name.
    // Hash should change.
    const before2 = (await links.files[0].file.info()).body;
    await mock.client.file(fileUri).upload({ filename: 'func.wasm', data: file2 });
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

    const file1 = await fs.readFile(fs.resolve('src/test/assets/func.wasm'));
    const file2 = await fs.readFile(fs.resolve('src/test/assets/kitten.jpg'));
    const file3 = await fs.readFile(fs.resolve('src/test/assets/bird.png'));

    // POST the file to the service.
    await clientA1.file.name('func.wasm').upload(file1);
    await clientA1.file.name('kitten.jpg').upload(file2);
    await clientA2.file.name('bird.png').upload(file3);

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
});
