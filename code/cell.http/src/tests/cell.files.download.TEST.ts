import { createMock, expect, fs, http, readFile, Schema, t } from '../test';

describe.only('cell/files: download', function() {
  this.timeout(50000);

  describe('download HTML file', () => {
    it('.html extension (header content-type: text/html)', async () => {
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
      await client.file.name(filename).download();

      expect(headers && headers['content-type']).to.eql('text/html');

      // Finish up.
      await mock.dispose();
    });

    it('no extension (header content-type: application/octet-stream)', async () => {
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
      await client.file.name(filename).download();

      expect(headers && headers['content-type']).to.eql('application/octet-stream');

      // Finish up.
      await mock.dispose();
    });
  });
});
