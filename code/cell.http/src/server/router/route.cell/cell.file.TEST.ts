import { Schema, createMock, expect, fs, http, t } from '../../../test';

describe('route: !A1/file', () => {
  it('writes file by name (updating the cell model)', async () => {
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

    // Finish up.
    await mock.dispose();
  });
});
