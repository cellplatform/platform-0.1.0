import { parse as parseUrl } from 'url';
import { createMock, expect, fs, http, readFile, Schema, t } from '../test';

describe('cell/file: upload', function() {
  this.timeout(50000);

  it('upload/download: 1 file', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/bird.png');
    const filename = 'bird.png';

    // Upload => download.
    await client.files.upload([{ filename, data }]);
    const res = await client.file.name(filename).download();

    // Save and compare.
    const path = fs.resolve('tmp/tmp-download');
    if (res.body) {
      await fs.stream.save(path, res.body);
    }
    expect((await fs.readFile(path)).toString()).to.eql(data.toString());

    // Finish up.
    await mock.dispose();
  });

  it('upload/download 2: files', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');

    // Cell model does not exist.
    const res1 = (await http.get(mock.url(cellUri))).json as t.IResGetCell;
    expect(res1.exists).to.eql(false);
    expect(res1.data).to.eql({});

    // Upload two files.
    const res2 = await client.files.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
    ]);

    (() => {
      expect(res2.status).to.eql(200);
      const data = res2.body;
      const cell = data.cell;
      const links = cell.links || {};
      expect(links['fs:func:wasm']).to.match(/^file\:foo/);
      expect(links['fs:kitten:jpg']).to.match(/^file\:foo/);

      const filenames = data.files.map(file => file.data.props.filename);
      expect(filenames).to.include('func.wasm');
      expect(filenames).to.include('kitten.jpg');
    })();

    // Compare the cell in the response with a new query to the cell from the service.
    expect((await client.info()).body.data).to.eql(res2.body.cell);

    // Ensure the file location has been stored.
    const files = (await client.files.list()).body;
    expect(files.length).to.eql(2);
    expect(files.every(f => f.props.location?.startsWith('file:///'))).to.eql(true);

    // Check the files exist.
    const downloadAndSave = async (filename: string, compareWith: Buffer) => {
      const file = files.find(file => file.props.filename === filename);
      const path = file?.props.location?.replace(/^file\:\/\//, '') || '';
      const byName = client.file.name(filename);
      const res = await byName.download();

      console.log('-------------------------------------------');
      console.log('res', res.status);
      // console.log('res.body', res.body);

      await fs.stream.save(path, res.body);
      console.log('-------------------------------------------');
      const buffer = await readFile(path);
      expect(buffer.toString()).to.eql(compareWith.toString());
    };

    // await downloadAndSave('func.wasm', file1);
    // return; // TEMP 🐷
    console.log(file2);
    await downloadAndSave('kitten.jpg', file2);

    // Finish up.
    await mock.dispose();
  });

  it('upload: file within folder-path', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    const kitten = await readFile('src/test/assets/kitten.jpg');
    const filename = 'foo/bar/kitten.jpg';
    const uploaded = await client.files.upload({ filename, data: kitten });

    // Ensure folder path is encoded within link-key on the cell.
    const cellLinks = uploaded.body.cell.links || {};
    const key = 'fs:foo::bar::kitten:jpg';
    expect(typeof cellLinks[key]).to.eql('string');
    expect(Schema.file.links.toKey(filename)).to.eql(key);

    // Ensure the file (and all relevant path data)
    // is represented within the cells "files" list.
    const urls = (await client.files.urls()).body;

    expect(urls.length).to.eql(1);
    expect(urls[0].uri).to.match(/^file:foo:/);
    expect(urls[0].filename).to.eql('kitten.jpg');
    expect(urls[0].dir).to.eql('foo/bar');
    expect(urls[0].path).to.eql('foo/bar/kitten.jpg');

    expect(urls[0].url).to.match(/^http:/);
    expect(urls[0].url).to.match(/cell:foo!A1\/file\/foo\/bar\/kitten.jpg\?/);
    expect(urls[0].url).to.match(/hash=sha256-/);

    // Finish up.
    await mock.dispose();
  });

  it('upload: then list (A1/files)', async () => {
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

  it('upload: does not send changes (by default)', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/kitten.jpg');
    const res = await client.files.upload([{ filename: 'kitten.jpg', data }]); // NB: {changes} option not specified.

    expect(res.body.changes).to.eql(undefined);

    // Finish up.
    await mock.dispose();
  });

  it('upload: sends changes (via option)', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);
    const file1 = await readFile('src/test/assets/kitten.jpg');
    const file2 = await readFile('src/test/assets/bird.png');
    const res = await client.files.upload(
      [
        { filename: 'kitten.jpg', data: file1 },
        { filename: 'bird.png', data: file2 },
      ],
      { changes: true },
    );

    await mock.dispose();

    const changes = res.body.changes;
    const uris = (changes || []).map(c => c.uri);

    expect(uris).to.include('ns:foo');
    expect(uris).to.include('cell:foo!A1');
    expect(uris.some(uri => uri.startsWith('file:foo:'))).to.eql(true);
  });

  it('upload: stores "integrity" data after upload, eg filehash (sha256) etc', async () => {
    const mock = await createMock();
    const client = mock.client.cell('cell:foo!A1');

    const file = await readFile('src/test/assets/func.wasm');
    const filehash = Schema.hash.sha256(file);
    const res = await client.files.upload([{ filename: 'func.wasm', data: file }]);

    // Ensure before/after state of the uploaded file.
    await (async () => {
      const files = res.body.files;
      expect(files.length).to.eql(1);

      const file = files[0].data;
      expect(file.props.integrity?.status).to.eql('VALID');
      expect(file.props.integrity?.uploadedAt).to.be.a('number');
      expect(file.props.integrity?.filehash).to.eql(filehash);
      expect(file.props.bytes).to.be.a('number');
      expect(file.props.location).to.be.match(/^file:\/\//);
    })();

    // Finish up.
    await mock.dispose();
  });

  it('upload: stores hash of uploaded file on cell "fs:" link', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/func.wasm');

    const uploadRes = await client.files.upload([{ filename: 'func.wasm', data }]);
    const filesRes = await client.files.list();
    const cellRes = await client.info();

    const links = uploadRes.body.cell.links || {};
    expect(cellRes.body.data.links).to.eql(links); // Cell links match on upload response with current cell info..

    const fileUri = links['fs:func:wasm'];
    const query = parseUrl(fileUri, true).query;

    expect(query.hash).to.match(/^sha256-/);
    expect(query.hash).to.eql(filesRes.body[0].hash);

    // Finish up.
    await mock.dispose();
  });

  it.skip('failed if filehash not sent to server', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/func.wasm');

    console.log('data', data);

    // Finish up.
    await mock.dispose();
  });

  /**
   * TODO 🐷
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
});
