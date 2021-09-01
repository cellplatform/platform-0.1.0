import {
  RouterMock,
  expect,
  fs,
  Http,
  readFile,
  Schema,
  t,
  http,
  is,
  writeThenReadStream,
  Hash,
} from '../../test';

describe('cell.fs: upload', function () {
  this.timeout(50000);

  const tmp = fs.resolve(`./tmp/download`);

  it('upload => download: 1 file', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);

    // Upload => download.
    const filename = 'bird.png';
    const data = await readFile('src/test/assets/bird.png');

    const upload = await client.fs.upload([{ filename, data }]);
    expect(upload.ok).to.eql(true);

    // Ensure the absolute file-path is exposed, not the shortened ("~") home folder.
    expect(upload.body.files.length).to.eql(1);
    expect(upload.body.files[0].data.props.location?.startsWith('file://~')).to.eql(false);

    const download = await client.fs.file(filename).download();
    expect(download.ok).to.eql(true);

    // Save and compare.
    const saved = await writeThenReadStream(tmp, download.body);
    expect(saved).to.eql(data);
    expect(Hash.sha256(saved)).to.eql(Hash.sha256(data));

    // Finish up.
    await mock.dispose();
  });

  it('upload => download 2: files', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');

    // Cell model does not exist.
    const res1 = (await http.get(mock.url(cellUri))).json as t.IResGetCell;
    expect(res1.exists).to.eql(false);
    expect(res1.data).to.eql({});

    // Upload two files.
    const res2 = await client.fs.upload([
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
    })();

    // Compare the cell in the response with a new query to the cell from the service.
    expect((await client.info()).body.data).to.eql(res2.body.cell);

    // Ensure the file location has been stored.
    const files = (await client.fs.list()).body;
    expect(files.length).to.eql(2);
    expect(files.every((f) => f.props.location?.startsWith('file:///'))).to.eql(true);

    const urls = (await client.fs.urls()).body;

    // Check the files exist.
    const downloadAndSave = async (filename: string, compareWith: Uint8Array) => {
      const byName = client.fs.file(filename);
      const res = await byName.download();
      const path = fs.resolve(`tmp/download`);
      if (typeof res.body === 'object') {
        await fs.stream.save(path, res.body);
      }

      const buffer = await readFile(path);
      expect(buffer.toString()).to.eql(compareWith.toString());
    };

    await downloadAndSave('func.wasm', file1);
    await downloadAndSave('kitten.jpg', file2);

    // Finish up.
    await mock.dispose();
  });

  it('upload: allowRedirect=false', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);

    const data = await readFile('src/test/assets/kitten.jpg');
    const uploaded = await client.fs.upload([
      { filename: 'foo/1.jpg', data, allowRedirect: false },
      { filename: 'foo/2.jpg', data, allowRedirect: true },
      { filename: 'foo/3.jpg', data },
    ]);

    const file1 = uploaded.body.files[0];
    const file2 = uploaded.body.files[1];
    const file3 = uploaded.body.files[2];

    expect(file1.data.props.allowRedirect).to.eql(false);
    expect(file2.data.props.allowRedirect).to.eql(true);
    expect(file3.data.props.allowRedirect).to.eql(undefined);

    const info = await client.fs.file('foo/1.jpg').info();
    expect(info.body.data.props.allowRedirect).to.eql(false);

    // Finish up.
    await mock.dispose();
  });

  it('upload: s3:permission', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);

    const data = await readFile('src/test/assets/kitten.jpg');
    const uploaded = await client.fs.upload([
      { filename: 'foo/1.jpg', data, 's3:permission': 'private' },
      { filename: 'foo/2.jpg', data, 's3:permission': 'public-read' },
      { filename: 'foo/3.jpg', data },
    ]);

    const file1 = uploaded.body.files[0];
    const file2 = uploaded.body.files[1];
    const file3 = uploaded.body.files[2];

    expect(file1.data.props['s3:permission']).to.eql('private');
    expect(file2.data.props['s3:permission']).to.eql('public-read');
    expect(file3.data.props['s3:permission']).to.eql('private');

    const expectPermission = async (path: string, permission: t.FsS3Permission) => {
      const info = await client.fs.file(path).info();
      expect(info.body.data.props['s3:permission']).to.eql(permission);
    };
    await expectPermission('foo/1.jpg', 'private');
    await expectPermission('foo/2.jpg', 'public-read');
    await expectPermission('foo/3.jpg', 'private');

    // Finish up.
    await mock.dispose();
  });

  it('upload: file within folder-path', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);

    const kitten = await readFile('src/test/assets/kitten.jpg');
    const filename = 'foo/bar/kitten.jpg';
    const uploaded = await client.fs.upload({ filename, data: kitten });

    // Ensure folder path is encoded within link-key on the cell.
    const cellLinks = uploaded.body.cell.links || {};
    const key = 'fs:foo::bar::kitten:jpg';
    expect(typeof cellLinks[key]).to.eql('string');
    expect(Schema.File.Links.toKey(filename)).to.eql(key);

    const link = Schema.File.Links.parse(key, cellLinks[key]);

    // Ensure the file (and all relevant path data)
    // is represented within the cells "files" list.
    const urls = (await client.fs.urls()).body;

    expect(urls.length).to.eql(1);
    expect(urls[0].uri).to.match(/^file:foo:/);
    expect(urls[0].filename).to.eql('kitten.jpg');
    expect(urls[0].dir).to.eql('foo/bar');
    expect(urls[0].path).to.eql('foo/bar/kitten.jpg');

    expect(urls[0].url).to.match(/^http:/);
    expect(urls[0].url).to.include(`cell:foo:A1/file:${link.uri.file}.jpg`);
    expect(urls[0].url).to.match(/hash=sha256-/);

    // Data returned on list.
    const list = (await client.fs.list()).body;

    expect(list.length).to.eql(1);
    expect(list[0].uri).to.match(/^file:foo:/);
    expect(list[0].filename).to.eql('kitten.jpg');
    expect(list[0].dir).to.eql('foo/bar');
    expect(list[0].path).to.eql('foo/bar/kitten.jpg');
    expect(list[0].props.bytes).to.eql(kitten.length);

    // Finish up.
    await mock.dispose();
  });

  it('upload then filter files set', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';

    const client = mock.client.cell(cellUri);
    const img = await readFile('src/test/assets/bird.png');

    await client.fs.upload([
      { filename: 'root.png', data: img },
      { filename: 'foo/bar/img.png', data: img },
      { filename: 'foo/img.png', data: img },
      { filename: 'foo/baz/img.png', data: img },
      { filename: 'foo/zoo/img.png', data: img },
    ]);

    const http = Http.create();
    const urls = mock.urls.cell(cellUri).files;

    const test = async (filter: string, expected?: string[]) => {
      const url = urls.list.query({ filter }).toString();
      const res = await http.get(url);
      const json = res.json as t.IResGetCellFs;
      const files = json.urls?.files.map((item) => item.path);
      expect(files).to.eql(expected);
    };

    const FOO = ['foo/bar/img.png', 'foo/img.png', 'foo/baz/img.png', 'foo/zoo/img.png'];
    const ALL = ['root.png', ...FOO];

    await test('/BOO', []);
    await test('/*', ['root.png']);
    await test('*', ['root.png']);

    await test('', ALL);
    await test('  ', ALL);
    await test('**', ALL);
    await test('**/*', ALL);

    await test('foo/**', FOO);
    await test('foo/b*/*', ['foo/bar/img.png', 'foo/baz/img.png']);

    // Finish up.
    await mock.dispose();
  });

  it('upload with explicit mimetype', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);

    const data = await readFile('src/test/assets/kitten.jpg');
    const uploaded = await client.fs.upload([
      { filename: 'one', data },
      { filename: 'two', data, mimetype: 'image/jpeg' },
    ]);
    const files = uploaded.body.files;

    expect(files[0].data.props.mimetype).to.eql('application/octet-stream');
    expect(files[1].data.props.mimetype).to.eql('image/jpeg');

    // Finish up.
    await mock.dispose();
  });

  it('upload: then list (A1/files)', async () => {
    const mock = await RouterMock.create();
    const A1 = 'cell:foo:A1';
    const A2 = 'cell:foo:A2';
    const clientA1 = mock.client.cell(A1);
    const clientA2 = mock.client.cell(A2);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');
    const file3 = await readFile('src/test/assets/bird.png');

    // POST the file to the service.
    await clientA1.fs.upload([
      { filename: 'func.wasm', data: file1 },
      { filename: 'kitten.jpg', data: file2 },
    ]);
    await clientA2.fs.upload({ filename: 'bird.png', data: file3 });

    const res1 = (await clientA1.fs.list()).body;
    const res2 = (await clientA2.fs.list()).body;

    expect(res1.length).to.eql(2);
    expect(res1[0].props.bytes).to.eql(file1.length);
    expect(res1[1].props.bytes).to.eql(file2.length);

    expect(res1[0].filename).to.eql('func.wasm');
    expect(res1[1].filename).to.eql('kitten.jpg');

    expect(res1[0].path).to.eql('func.wasm');
    expect(res1[1].path).to.eql('kitten.jpg');

    expect(res1[0].dir).to.eql('');
    expect(res1[1].dir).to.eql('');

    expect(res2.length).to.eql(1);
    expect(res2[0].props.bytes).to.eql(file3.length);
    expect(res2[0].filename).to.eql('bird.png');
    expect(res2[0].path).to.eql('bird.png');
    expect(res2[0].dir).to.eql('');

    // Finish up.
    await mock.dispose();
  });

  it('upload: does not send changes (by default)', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/kitten.jpg');
    const res = await client.fs.upload([{ filename: 'kitten.jpg', data }]); // NB: {changes} option not specified.

    expect(res.body.changes).to.eql(undefined);

    // Finish up.
    await mock.dispose();
  });

  it('upload: sends changes (via option)', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);
    const file1 = await readFile('src/test/assets/kitten.jpg');
    const file2 = await readFile('src/test/assets/bird.png');
    const res = await client.fs.upload(
      [
        { filename: 'kitten.jpg', data: file1 },
        { filename: 'bird.png', data: file2 },
      ],
      { changes: true },
    );

    await mock.dispose();

    const changes = res.body.changes;
    const uris = (changes || []).map((c) => c.uri);

    expect(uris).to.include('ns:foo');
    expect(uris).to.include('cell:foo:A1');
    expect(uris.some((uri) => uri.startsWith('file:foo:'))).to.eql(true);
  });

  it('upload: stores "integrity" data after upload, eg filehash (sha256) etc', async () => {
    const mock = await RouterMock.create();
    const client = mock.client.cell('cell:foo:A1');

    const file = await readFile('src/test/assets/func.wasm');
    const filehash = Schema.Hash.sha256(file);
    const res = await client.fs.upload([{ filename: 'func.wasm', data: file }]);

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
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/func.wasm');

    const uploadRes = await client.fs.upload([{ filename: 'func.wasm', data }]);
    const filesRes = await client.fs.list();
    const cellRes = await client.info();

    await mock.dispose();

    const links = uploadRes.body.cell.links || {};
    expect(cellRes.body.data.links).to.eql(links); // Cell links match on upload response with current cell info..

    const fileUri = links['fs:func:wasm'];
    const hash = new URL(fileUri).searchParams.get('hash');

    expect(hash).to.match(/^sha256-/);
    expect(hash).to.eql(filesRes.body[0].hash);
  });

  /**
   * TODO 🐷
   * - pass filehash (sha256) in upload body
   * - fix all tests
   * - verify endpoint (download) - different URL to "complete upload" endpoint.
   *
   */

  it.skip('downloads a file by name (failing if the underlying file-hash changes)', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const cellClient = mock.client.cell(cellUri);

    const file1 = await readFile('src/test/assets/func.wasm');
    const file2 = await readFile('src/test/assets/kitten.jpg');

    // POST the file to the service.
    await cellClient.fs.upload({ filename: 'func.wasm', data: file1 });

    // Save and compare the downloaded stream.
    const path = fs.resolve('tmp/test/download/func.wasm');
    const res = await cellClient.fs.file('func.wasm').download();
    if (typeof res.body === 'object') {
      await fs.stream.save(path, res.body);
    }
    expect((await readFile(path)).toString()).to.eql(file1.toString());

    const links = (await cellClient.links.read()).body;

    // Upload the same image, hashes should not change.
    const before1 = (await links.files[0].http.info()).body;
    await cellClient.fs.upload({ filename: 'func.wasm', data: file1 });
    const after1 = (await links.files[0].http.info()).body;
    expect(before1.data.hash).to.eql(after1.data.hash);

    // Perform a download - should work find (because hashes still match).
    const download1 = await cellClient.fs.file('func.wasm').download();
    expect(download1.status).to.eql(200);

    // Upload a different image, with the same name.
    // Hash should change.
    const before2 = (await links.files[0].http.info()).body;
    await cellClient.fs.upload({ filename: 'func.wasm', data: file2 });
    const after2 = (await links.files[0].http.info()).body;
    expect(before2.data.hash).to.not.eql(after2.data.hash);

    // Attempt to download the image from the cell.
    // ERROR should happen because of hash-mismatch.
    const download2 = await cellClient.fs.file('func.wasm').download();
    expect(download2.ok).to.eql(false);
    expect(download2.status).to.eql(409);
    expect(download2.error && download2.error.message).to.contains('hash does not match');

    // Get info about the file, from the `file.name` client.
    const fileInfo = await cellClient.fs.file('func.wasm').info();
    expect(fileInfo.status).to.eql(200);
    expect(fileInfo.body.data.props.bytes).to.eql(file1.length);

    // Finish up.
    await mock.dispose();
  });

  it('event: "HttpClient/upload"', async () => {
    const mock = await RouterMock.create();
    const cellUri = 'cell:foo:A1';
    const client = mock.client.cell(cellUri);
    const data = await readFile('src/test/assets/func.wasm');

    const promise = client.fs.upload([
      { filename: 'file-1.wasm', data },
      { filename: 'file-2.wasm', data },
      { filename: 'file-3.wasm', data },
    ]);
    expect(is.observable(promise.event$)).to.eql(true);

    const fired: t.IHttpClientUploaded[] = [];
    promise.event$.subscribe((e) => fired.push(e.payload));

    await promise;

    expect(fired.length).to.eql(4);

    // Initial starting event.
    expect(fired[0].uri).to.eql('cell:foo:A1');
    expect(fired[0].tx.length).to.greaterThan(10); // NB: cuid.
    expect(fired[0].file).to.eql(undefined); // NB: Initial "starting" event - no file completed uploading yet.
    expect(fired[0].error).to.eql(undefined);
    expect(fired[0].total).to.eql(3);
    expect(fired[0].completed).to.eql(0);
    expect(fired[0].done).to.eql(false);

    expect(fired.map((e) => e.completed)).to.eql([0, 1, 2, 3]);
    expect(fired.map((e) => e.done)).to.eql([false, false, false, true]);
    expect(fired.map((e) => Boolean(e.file))).to.eql([false, true, true, true]);

    // Finish up.
    await mock.dispose();
  });
});
