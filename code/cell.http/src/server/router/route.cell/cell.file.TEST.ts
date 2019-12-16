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

    // Load the file info and compare hash.
    const res3 = await http.get(mock.urls.file(link.split('?')[0]).info.toString());
    const fileHash = (res3.json as t.IResGetFile).data.hash;
    expect(link.split('?')[1]).to.eql(`hash=${fileHash}`);

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

  it.only('reads a file by name (failing if the underlying file-hash changes)', async () => {
    // TODO 🐷

    /**
     * TODO 🐷
     * - post file from URL client
     * - download file
     * - download file (with hash, throw 409 if hash mismatch)
     */

    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    // POST the file to the service.
    const file1 = await fs.readFile(fs.resolve('src/test/assets/func.wasm'));
    await client.file.name('func.wasm').upload(file1);

    // Download the file.
    const res = await client.file.name('func.wasm').download();

    console.log('-------------------------------------------');
    console.log('res', res);
    console.log('-------------------------------------------');

    // Save the download stream.
    const path = fs.resolve('tmp/test/download/func.wasm');
    // await fs.ensureDir(fs.dirname(path));
    // const output = fs.createWriteStream(path);

    if (res.body) {
      await fs.stream.save(path, res.body as any);
    }

    // const output = fs.createWriteStream(path);
    // await streamPipeline(res.body , output);

    console.log('path', path);

    // Finish up.
    await mock.dispose();
  });
});

// const downloadFile = async (url: string, path: string) => {
//   const res = await fetch(url);
//   const fileStream = fs.createWriteStream(path);
//   await new Promise((resolve, reject) => {
//     if (res) {
//       res.body.pipe(fileStream);
//       res.body.on('error', err => {
//         reject(err);
//       });
//       fileStream.on('finish', function() {
//         resolve();
//       });
//     }
//   });
// };
