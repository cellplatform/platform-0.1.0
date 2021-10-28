import { expect } from 'chai';
import { Test } from 'sys.ui.dev';
import { FsDriverIndexedDB } from '.';
import { slug, time, Hash, Schema, Format } from './common';
import { IndexedDb } from './IndexedDb';

const LocalFile = Schema.File.Path.Local;

export default Test.describe('FsDriver.IndexedDb', (e) => {
  const testCreate = async () => {
    const name = 'test.foo';
    const db = await FsDriverIndexedDB({ name });

    return { db, name };
  };

  e.it('write/read: single file', async (e) => {
    const { db, name } = await testCreate();

    expect(db.name).to.eql(name);
    expect(db.version).to.eql(1);

    const uri = `path:write-single/test-${slug()}`;
    const path = Format.uriToPath(uri);
    const data = new Uint8Array([1, 2, 3]);

    const res1 = await db.driver.read(uri);
    expect(res1.ok).to.eql(false);
    expect(res1.status).to.eql(404);
    expect(res1.file).to.eql(undefined);
    expect(res1.uri).to.eql(uri);

    expect(res1.error?.type).to.eql('FS/read');
    expect(res1.error?.message).to.include('File not found');
    expect(res1.error?.path).to.eql(path);

    const res2 = await db.driver.write(uri, data);
    expect(res2.ok).to.eql(true);
    expect(res2.uri).to.eql(uri);
    expect(res2.error).to.eql(undefined);
    expect(res2.file.data).to.eql(data);
    expect(res2.file.hash).to.eql(Hash.sha256(data));
    expect(res2.file.path).to.eql(path);
    expect(res2.file.location).to.eql(path);

    const res3 = await db.driver.read(uri);
    console.log('res1', res3);
    expect(res3.ok).to.eql(true);
    expect(res3.status).to.eql(200);
    expect(res3.error).to.eql(undefined);
    expect(res3.file).to.eql(res2.file);
  });

  e.it.skip('write: stream', async () => {
    const { db } = await testCreate();
    //
    // from HTTP
    //
  });

  e.it.skip('write: same file, multiple path', async () => {
    const { db } = await testCreate();
    //
  });

  e.it.skip('delete', async (e) => {
    const { db } = await testCreate();

    const uri = `path:delete/test-${slug()}`;
    const data = new Uint8Array([1, 2, 3]);

    const res1 = await db.driver.read(uri);

    console.log('res1', res1);

    expect(res1.file).to.eql(undefined); // Does not exist.

    await db.driver.write(uri, data);

    const res2 = await db.driver.read(uri);
    expect(res2.file?.data).to.eql(data); // Does exist.

    const res = await db.driver.delete(uri);

    console.log('-------------------------------------------');
    console.log('res', res);
  });
});
