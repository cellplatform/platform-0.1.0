import { Schema, createMock, expect, FormData, fs, http, t } from '../../../test';

describe('route: !A1/file', () => {
  it('writes file to the filesystem and updates model', async () => {
    const mock = await createMock();

    // Cell model does not exist.
    const res1 = (await http.get(mock.url('cell:foo!A1'))).json() as t.IResGetCell;
    expect(res1.exists).to.eql(false);
    expect(res1.data).to.eql({});

    // Prepare form.
    const path = fs.resolve('src/test/assets/func.wasm');
    const sourceFile = await fs.readFile(path);
    const form = new FormData();
    form.append('foo', sourceFile, { contentType: 'application/octet-stream' });

    // POST the file to the service.
    const url = mock.url(`cell:foo!A1/file/func.wasm`);
    const headers = form.getHeaders();
    const res2 = (await http.post(url, form, { headers })).json() as t.IResPostCellFile;

    await mock.dispose();

    // Ensure the URI to the file was stored.
    const cell = res2.data.cell;
    const link = (cell.links || {})['fs:func:wasm'];
    const uri = Schema.uri.parse<t.IFileUri>(link);
    expect(uri.ok).to.eql(true);

    // Load the saved file and ensure it matches the source.
    const targetFilePath = fs.resolve(`tmp/fs/ns.${uri.parts.ns}/${uri.parts.file}`);
    const targetFile = await fs.readFile(targetFilePath);
    expect(targetFile.toString()).to.eql(sourceFile.toString());

    // Examine changes.
    const changes = res2.data.changes || [];
    expect(changes[0].uri).to.eql('cell:foo!A1');
    expect(changes[0].field).to.eql('links');
    expect(changes[0].from).to.eql(undefined);
    expect(changes[0].to).to.eql({ 'fs:func:wasm': uri.toString() });
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
