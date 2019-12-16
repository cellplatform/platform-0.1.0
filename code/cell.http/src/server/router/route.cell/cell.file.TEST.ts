import { Schema, createMock, expect, fs, http, t } from '../../../test';

describe('route: !A1/file', () => {
  it.only('writes file to the filesystem and updates model', async () => {
    const mock = await createMock();

    const cellUri = 'cell:foo!A1';

    // Cell model does not exist.
    const res1 = (await http.get(mock.url(cellUri))).json() as t.IResGetCell;
    expect(res1.exists).to.eql(false);
    expect(res1.data).to.eql({});

    // POST the file to the service.
    const sourceFile = await fs.readFile(fs.resolve('src/test/assets/func.wasm'));
    const client = mock.client.cell(cellUri);
    const res2 = await client.file.post({ filename: 'func.wasm', data: sourceFile });

    // Ensure the URI to the file was stored.
    const cell = res2.json.data.cell;
    const link = (cell.links || {})['fs:func:wasm'];
    const uri = Schema.uri.parse<t.IFileUri>(link);
    expect(uri.ok).to.eql(true);

    // Load the file info and compare hash.
    const res3 = await http.get(mock.urls.file(link.split('?')[0]).info.toString());
    const fileHash = res3.json<t.IResGetFile>().data.hash;
    expect(link.split('?')[1]).to.eql(`hash=${fileHash}`);

    // Load the saved file and ensure it matches the source.
    const targetFilePath = fs.resolve(`tmp/fs/ns.${uri.parts.ns}/${uri.parts.file}`);
    const targetFile = await fs.readFile(targetFilePath);

    expect(targetFile.toString()).to.eql(sourceFile.toString());

    // Examine changes.
    const changes = res2.json.data.changes || [];
    expect(changes[0].uri).to.eql(cellUri);
    expect(changes[0].field).to.eql('links');
    expect(changes[0].from).to.eql(undefined);
    expect(changes[0].to).to.eql({ 'fs:func:wasm': link });

    await mock.dispose();
  });

  it.skip('reads a file (via /cell:foo!A1/file/kitten.js', async () => {
    // TODO 🐷

    /**
     * TODO 🐷
     * - post file from URL client
     * - download file
     * - download file (with hash, throw 409 if hash mismatch)
     */

    const mock = await createMock();

    await mock.dispose();
  });
});
