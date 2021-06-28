import { IMicroRequest } from '@platform/micro';
import * as semver from 'semver';

import { createMock, expect, Http, HttpClient, t, testFiles, time } from '../../test';

describe('HttpClient', () => {
  describe('headers', () => {
    it('sends headers (client/schema version)', async () => {
      const mock = await createMock();
      const client = mock.client;

      const requests: IMicroRequest[] = [];
      mock.service.request$.subscribe((e) => requests.push(e));
      await client.cell('cell:foo:A1').info();
      await mock.dispose();

      expect(requests.length).to.eql(1);
      const headers = requests[0].req.headers || {};

      const isValidVersion = (version: string) => semver.valid(version) !== null;

      const header = (headers.client || '') as string;
      expect(header).to.include('client@');
      expect(header).to.include('schema@');

      const parts = header.split(';');
      parts
        .filter((item) => item.includes('@'))
        .forEach((item) => {
          const version = item.split('@')[1];
          expect(isValidVersion(version)).to.eql(true);
        });
    });

    it('uses custom HTTP client (merging headers)', async () => {
      const mock = await createMock();
      const http = Http.create({ headers: { foo: 'hello' } });
      const client = HttpClient.create({ http, host: mock.port });

      const headers: t.IHttpHeaders[] = [];
      mock.service.request$.subscribe((e) => headers.push(e.req.headers as t.IHttpHeaders));

      const res = await client.info();
      await mock.dispose();

      expect(res.ok).to.eql(true);

      // NB: Headers from passed in client, along with default headers, are passed to server.
      expect(headers[0].foo).to.eql('hello');
      expect(headers[0].client).to.includes('schema@');
    });
  });

  describe('http.ns', () => {
    it('exists', async () => {
      const mock = await createMock();
      const ns = mock.client.ns('ns:foo');

      expect(await ns.exists()).to.eql(false);

      await ns.write({ ns: { type: { implements: 'ns:foobar' } } });
      expect(await ns.exists()).to.eql(true);

      await mock.dispose();
    });
  });

  describe('http.cell', () => {
    it('exists', async () => {
      const mock = await createMock();
      const ns = mock.client.ns('ns:foo');
      const cell = mock.client.cell('cell:foo:A1');

      expect(await cell.exists()).to.eql(false);

      await ns.write({ cells: { A1: { value: 123 } } });
      expect(await cell.exists()).to.eql(true);

      await mock.dispose();
    });

    it('copy (sample)', async () => {
      const mock = await createMock();
      const ns = mock.client.ns('ns:foo');

      const A1 = { value: 123, props: { foo: 'hello' } };
      await ns.write({ cells: { A1 } });

      /**
       * NOTE:
       *    This shows a simple copy between a source and a target.
       *
       *    We may want to enshrine this as a native "copy" operation
       *    on the client.
       *
       *    It should ALSO handle copying over linked files (if the host differs).
       */
      const copy = async (http: t.IHttpClient, sourceUri: string, targetUri: string) => {
        const source = http.cell(sourceUri);
        const target = http.cell(targetUri);
        const info = await source.info();
        const ns = http.ns(target.uri.ns);
        await ns.write({ cells: { [target.uri.key]: info.body.data } });
      };

      const from = 'cell:foo:A1';
      const to = 'cell:foo:Z9';
      await copy(mock.client, from, to);

      await time.wait(10);

      const sourceInfo = await mock.client.cell(from).info();
      const targetInfo = await mock.client.cell(to).info();

      expect(targetInfo.body.data.value).to.eql(A1.value);
      expect(targetInfo.body.data.props).to.eql(A1.props);
      expect(targetInfo.body.data.hash).to.not.eql(sourceInfo.body.data.hash);
      expect(targetInfo.body.modifiedAt).to.not.eql(sourceInfo.body.modifiedAt);

      await mock.dispose();
    });
  });

  describe('http.cell.file', () => {
    it('exists', async () => {
      const mock = await createMock();
      const cell = mock.client.cell('cell:foo:A1');

      const filename = 'foo.png';
      const file = cell.fs.file(filename);
      expect(await file.exists()).to.eql(false);

      const { file1: data } = await testFiles();
      await cell.fs.upload({ filename, data });
      expect(await file.exists()).to.eql(true);

      await mock.dispose();
    });

    it('info', async () => {
      const mock = await createMock();
      const cell = mock.client.cell('cell:foo:A1');

      const filename = 'foo.png';
      const file = cell.fs.file(filename);

      const { file1 } = await testFiles();
      await cell.fs.upload([{ filename, data: file1 }]);

      const info = await file.info();
      expect(info.ok).to.eql(true);
      expect(info.status).to.eql(200);
      expect(info.body.data.props.mimetype).to.eql('image/png');

      await mock.dispose();
    });

    it('upload error: no files provided', async () => {
      const mock = await createMock();
      const cell = mock.client.cell('cell:foo:A1');

      const res = await cell.fs.upload([]);
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(400);

      expect(res.error?.type).to.eql('HTTP/file');
      expect(res.error?.message).to.include('Failed to upload');
      expect(res.error?.status).to.eql(400);

      expect(res.body.errors.length).to.eql(1);

      const error = res.body.errors[0];
      expect(error.type).to.eql('HTTP/file');
      expect(error.message).to.include('No files provided to client to upload');
      expect(error.status).to.eql(400);
    });
  });
});
