import { Test, expect } from '../web.test';
import { Filesystem } from '.';
import { rx, DEFAULT, Hash, t } from './common';

import Automerge from 'automerge';

export default Test.describe('FsBus', (e) => {
  const testPrep = async (options: { id?: string; clear?: boolean } = {}) => {
    const { id = 'dev.test.FsBus' } = options;
    const bus = rx.bus();
    const { store } = await Filesystem.create({ bus, id });
    const fs = store.fs();

    const dispose = store.dispose;

    const deleteAll = async () => {
      const manifest = await fs.manifest();
      await Promise.all(manifest.files.map(async (file) => fs.delete(file.path)));
    };

    if (options.clear) await deleteAll();
    return { store, fs, dispose, deleteAll };
  };

  const testFile = (path: string, text?: string) => {
    const data = new TextEncoder().encode(text ?? 'hello');
    const hash = Hash.sha256(data);
    const bytes = data.byteLength;
    return { path, data, hash, bytes };
  };

  e.it('id (default)', async () => {
    const bus = rx.bus();
    const { store } = await Filesystem.create({ bus });
    expect(store.id).to.eql(DEFAULT.FILESYSTEM_ID);
    store.dispose();
  });

  e.it('dir (root)', async () => {
    const { store, dispose } = await testPrep();
    expect(store.dir).to.eql('/');
    dispose();
  });

  e.it('dispose', async () => {
    const { store } = await testPrep();

    let count = 0;
    store.dispose$.subscribe((e) => count++);

    store.dispose();
    store.dispose();
    store.dispose();
    expect(count).to.eql(1);
  });

  e.describe('I/O', (e) => {
    e.it('read/write', async () => {
      const { fs, dispose } = await testPrep({ clear: true });

      const path = 'foo/bar.txt';
      const data = new TextEncoder().encode('hello');

      const res1 = await fs.read(path);
      const res2 = await fs.write(path, data);
      const res3 = await fs.read(path);

      expect(res1).to.eql(undefined);

      expect(res2.bytes).to.eql(data.byteLength);
      expect(res2.hash).to.eql(Hash.sha256(data));

      expect(res3).to.eql(data);
      dispose();
    });

    e.it('copy', async () => {
      const { fs, dispose } = await testPrep({ clear: true });

      const path1 = 'foo/1.txt';
      const path2 = 'foo/2.txt';
      const data = new TextEncoder().encode('hello');

      const res0 = await fs.info(path2);
      expect(res0.exists).to.eql(false);

      const res1 = await fs.write(path1, data);
      expect(res1.bytes).to.eql(data.byteLength);
      expect(res1.hash).to.eql(Hash.sha256(data));

      await fs.copy(path1, path2);

      const res2 = await fs.info(path2);
      expect(res2.bytes).to.eql(data.byteLength);
      expect(res2.hash).to.eql(Hash.sha256(data));

      dispose();
    });

    e.it('move', async () => {
      const { fs, dispose } = await testPrep({ clear: true });

      const path1 = 'foo/1.txt';
      const path2 = 'foo/2.txt';
      const data = new TextEncoder().encode('hello');

      const res0 = await fs.info(path2);
      expect(res0.exists).to.eql(false);

      const res1 = await fs.write(path1, data);
      expect(res1.bytes).to.eql(data.byteLength);
      expect(res1.hash).to.eql(Hash.sha256(data));

      await fs.move(path1, path2);

      const res2 = await fs.info(path2);
      expect(res2.bytes).to.eql(data.byteLength);
      expect(res2.hash).to.eql(Hash.sha256(data));

      const res3 = await fs.info(path1);
      expect(res3.exists).to.eql(false);

      dispose();
    });

    e.it('delete', async () => {
      const { fs, dispose } = await testPrep({ clear: true });

      const path = 'foo/file.txt';
      const data = new TextEncoder().encode('hello');

      await fs.write(path, data);
      expect((await fs.info(path)).exists).to.eql(true);

      await fs.delete(path);
      expect((await fs.info(path)).exists).to.eql(false);

      dispose();
    });

    e.describe('json (read/write)', (e) => {
      const test = async (data: t.Json) => {
        const path = 'foo/data.json';
        const { fs, dispose } = await testPrep({ clear: true });

        await fs.json.write(path, data);
        const res = await fs.json.read(path);
        dispose();

        expect(res).to.eql(data);
      };

      e.it('{object}', async () => {
        await test({});
        await test({ msg: 'hello' });
      });

      e.it('[array]', async () => {
        await test([]);
        await test([1, 2, 3]);
        await test([1, { msg: 'hello' }, true]);
      });

      e.it('boolean', async () => {
        await test(true);
        await test(false);
      });

      e.it('number', async () => {
        await test(0);
        await test(1234);
        await test(-999);
      });

      e.it('string', async () => {
        await test('   Hello   ');
        await test('');
      });

      e.it('null', async () => {
        await test(null);
      });
    });
  });

  e.describe('Manifest (Indexer)', (e) => {
    e.it('empty', async () => {
      const { fs, dispose } = await testPrep({ clear: true });
      const manifest = await fs.manifest();

      expect(manifest.kind).to.eql('dir');
      expect(manifest.files).to.eql([]);

      dispose();
    });

    e.it('files', async () => {
      const { fs, dispose } = await testPrep({ clear: true });
      const file1 = testFile('foo.txt');
      const file2 = testFile('foo/bar.txt');

      const manifest1 = await fs.manifest();
      expect(manifest1.files).to.eql([]);

      await fs.write(file1.path, file1.data);
      await fs.write(file2.path, file2.data);

      const manifest2 = await fs.manifest();
      const files = manifest2.files;

      expect(files.length).to.eql(2);

      expect(files[0].path).to.eql(file1.path);
      expect(files[1].path).to.eql(file2.path);

      expect(files[0].filehash).to.eql(file1.hash);
      expect(files[1].filehash).to.eql(file2.hash);

      dispose();
    });

    e.it('manifest({ cache })', async () => {
      const { fs, dispose } = await testPrep({ clear: true });
      const file = testFile('foo.txt');
      await fs.write(file.path, file.data);

      // 1. Initial call (request the creation of a file containing the manifest).
      const cachefile = 'my-manifest.json';
      const manifest1 = await fs.manifest({ cache: true, cachefile });

      // 2. Second call (the file exists and can be read).
      const manifest2 = await fs.manifest({});

      const files2 = manifest2.files;
      expect(files2.length).to.eql(2); // NB: New manifest file not saved (yet) at the time the function does it's initial return.

      const paths = files2.map((file) => file.path);
      expect(paths.length).to.eql(2);
      expect(paths).to.eql([file.path, cachefile]);

      dispose();
    });

    e.describe('CRDT', (e) => {
      const path = 'file.crdt';

      e.it('automerge: save', async () => {
        const { fs, dispose } = await testPrep({ clear: true });
        console.log('Automerge', Automerge);

        // type C
        type C = { title: string; done: boolean };
        type T = { cards: C[] };

        let doc = Automerge.from<T>({ cards: [] });

        doc = Automerge.change(doc, 'Add card', (doc) => {
          doc.cards.push({ title: 'foobar', done: false });
        });

        const data = Automerge.save(doc);

        console.log('s', data);
        const res = await fs.write(path, data);

        console.log('res', res);

        dispose();
      });

      e.it.skip('automerge: load', async () => {
        const { fs, dispose } = await testPrep({ clear: false });

        const res = await fs.read(path);

        const str = new TextDecoder().decode(res);

        console.log('res', res);

        const actorId = '1234-abcd-56789-qrstuv';
        // const doc1 = Automerge.init(actorId);
        // const doc2 = Automerge.from({ foo: 1 }, actorId);
        const doc3 = Automerge.load(str, actorId);

        console.log('str', str);
        // console.log('doc3', doc3);

        dispose();
      });
    });
  });
});
