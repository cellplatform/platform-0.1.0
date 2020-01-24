import { createMock, expect, fs, http, readFile, Schema, t } from '../test';

const bodyToText = async (body: ReadableStream | string) => {
  if (typeof body === 'string') {
    return body;
  } else {
    const path = fs.resolve(`tmp/test/index.html`);
    await fs.stream.save(path, body);
    return (await fs.readFile(path)).toString();
  }
};

describe('cell/files: download', function() {
  this.timeout(50000);

  it('no file extension (content-type: "application/octet-stream")', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    // Upload HTML file.
    const filename = 'foo';
    const data = await readFile('src/test/assets/index.html');
    await client.files.upload([{ filename, data }]);

    // Download the file and check headers.
    let headers: undefined | t.IHttpHeaders;
    mock.client.response$.subscribe(e => (headers = e.response.headers));

    const res = await client.file.name(filename).download();
    const html = await bodyToText(res.body);

    expect(res.ok).to.eql(true);
    expect(headers && headers['content-type']).to.eql('application/octet-stream');
    expect(html).to.contain('<title>My Title</title>');

    // Finish up.
    await mock.dispose();
  });

  it('[.html] file extension (content-type: "text/html")', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    // Upload HTML file.
    const filename = 'index.html';
    const data = await readFile('src/test/assets/index.html');
    await client.files.upload([{ filename, data }]);

    // Download the file and check headers.
    let headers: undefined | t.IHttpHeaders;
    mock.client.response$.subscribe(e => (headers = e.response.headers));

    const res = await client.file.name(filename).download();
    const html = await bodyToText(res.body);

    expect(res.ok).to.eql(true);
    expect(headers && headers['content-type']).to.eql('text/html');
    expect(html).to.contain('<title>My Title</title>');

    // Finish up.
    await mock.dispose();
  });

  it('download HTML and re-write relative links', async () => {
    const mock = await createMock();
    const cellUri = 'cell:foo!A1';
    const client = mock.client.cell(cellUri);

    // Upload HTML file.
    const filename = 'index.html';
    const file = {
      html: await readFile('src/test/assets/index.html'),
      css: await readFile('src/test/assets/style.css'),
      js: await readFile('src/test/assets/file.js'),
    };

    await client.files.upload([
      { filename, data: file.html },
      { filename: 'assets/style.css', data: file.css },
      { filename: 'file.js', data: file.js },
    ]);

    // Download the file and check headers.
    let headers: undefined | t.IHttpHeaders;
    mock.client.response$.subscribe(e => (headers = e.response.headers));
    const res = await client.file.name(filename).download();
    const html = await bodyToText(res.body);

    expect(headers && headers['content-type']).to.eql('text/html');

    // Ensure absolute links remain unchanged
    expect(html).to.contain('<link rel="stylesheet" href="style.css">');
    expect(html).to.contain('<link rel="stylesheet" href="https://foo.com/style.css">');
    expect(html).to.contain('<script src="https://foo.com/file.js"></script>');

    // Ensure relative links have been updated.
    expect(html).to.contain('<script id="app" src="http://localhost:');
    expect(html).to.contain('<link id="styles" rel="stylesheet" href="http://localhost:');

    // Finish up.
    await mock.dispose();
  });
});
