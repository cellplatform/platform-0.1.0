import { NodeRuntime } from '@platform/cell.runtime.node';

import {
  Compiler,
  createMock,
  expect,
  fs,
  Http,
  readFile,
  Schema,
  t,
  TestCompile,
} from '../../test';
import { EntryParams, Result } from './sample.NodeRuntime/types';

type B = t.RuntimeBundleOrigin;

const ENTRY = {
  NODE: './src/tests/test.cell.runtime.node/sample.NodeRuntime',
};

export const samples = {
  node: TestCompile.make(
    'NodeRuntime',
    Compiler.config('NodeRuntime')
      .namespace('sample')
      .target('node')
      .entry(`${ENTRY.NODE}/main`)
      .entry('dev', `${ENTRY.NODE}/dev`),
  ),

  math: TestCompile.make(
    'math',
    Compiler.config('math')
      .namespace('sample')
      .target('node')
      .entry('./src/tests/test.cell.runtime.node/sample.math/main')
      .entry('sum', './src/tests/test.cell.runtime.node/sample.math/math.sum'),
  ),
};

const noManifest = (file: t.IHttpClientCellFileUpload) => !file.filename.endsWith('index.json'); // NB: Cause error by filtering out the manifest file.

const createFuncMock = async () => {
  const runtime = NodeRuntime.create();
  const mock = await createMock({ runtime });
  const http = Http.create();
  const url = mock.urls.fn.run.toString();
  return { url, mock, http, runtime };
};

const prepare = async (options: { dir?: string; uri?: string } = {}) => {
  const { dir, uri = 'cell:foo:A1' } = options;
  const { mock, runtime, http, url } = await createFuncMock();
  const { host } = mock;
  const client = mock.client.cell(uri);
  const bundle: B = { host, uri, dir };
  return { mock, runtime, http, client, bundle, url, uri };
};

const bundleToFiles = async (sourceDir: string, targetDir?: string) => {
  targetDir = (targetDir || '').trim();
  const base = fs.resolve('.');
  const paths = await fs.glob.find(fs.join(base, sourceDir, '**'));
  const files = await Promise.all(
    paths.map(async (path) => {
      const data = await readFile(path);
      let filename = path.substring(fs.join(base, sourceDir).length + 1);
      filename = targetDir ? fs.join(targetDir, filename) : filename;
      return { filename, data } as t.IHttpClientCellFileUpload;
    }),
  );
  return files;
};

const uploadBundle = async (
  client: t.IHttpClientCell,
  bundle: B,
  options: { filter?: (file: t.IHttpClientCellFileUpload) => boolean } = {},
) => {
  const { filter } = options;
  let files = await bundleToFiles(samples.node.outdir, bundle.dir);
  files = filter ? files.filter((file) => filter(file)) : files;
  const upload = await client.files.upload(files);
  expect(upload.ok).to.eql(true);
  return {
    files,
    upload,
    bundle,
    get manifest() {
      const json = JSON.parse(
        files.find((f) => f.filename.endsWith('index.json'))?.data.toString() || '',
      );
      return json as t.BundleManifest;
    },
  };
};

describe.only('cell.runtime.node: NodeRuntime', function () {
  this.timeout(99999);

  /**
   * Ensure the sample [node] code as been bundled.
   */
  before(async () => {
    const force = false;
    await samples.node.bundle(force);
    await samples.math.bundle(force);
  });
  beforeEach(async () => await fs.remove(fs.resolve('tmp/runtime.node')));

  describe('pull', () => {
    const test = async (dir?: string) => {
      const { mock, runtime, bundle, client } = await prepare({ dir });
      expect(await runtime.exists(bundle)).to.eql(false);

      await uploadBundle(client, bundle);
      const res = await runtime.pull(bundle, { silent: true });
      await mock.dispose();

      const urls = Schema.urls(mock.host);

      expect(res.ok).to.eql(true);
      expect(res.errors).to.eql([]);
      expect(res.manifest).to.eql(urls.fn.bundle.manifest(bundle).toString());
      expect(await runtime.exists(bundle)).to.eql(true);
    };

    it('with sub-directory', async () => {
      await test('foo/bar/');
      await test('sample///'); // NB: Path will be cleaned.
    });

    it('without sub-directory', async () => {
      await test();
      await test('');
      await test('  ');
    });

    it('error: empty list', async () => {
      const dir = 'foo';
      const { mock, runtime, bundle } = await prepare({ dir });

      const res = await runtime.pull(bundle, { silent: true });
      const error = res.errors[0];
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);

      expect(error.type).to.eql('RUNTIME/pull');
      expect(error.message).to.include('contains no files to pull');
      expect(error.bundle).to.eql(bundle);
    });

    it('error: no manifest', async () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });

        await uploadBundle(client, bundle, { filter: noManifest });

        const res = await runtime.pull(bundle, { silent: true });
        const error = res.errors[0];
        await mock.dispose();

        expect(res.ok).to.eql(false);
        expect(res.errors.length).to.eql(1);
        expect(error.type).to.eql('RUNTIME/pull');
        expect(error.message).to.include('The bundle does not contain a manifest');
        expect(error.bundle).to.eql(bundle);
      };

      await test('foo');
      await test('foo/bar');
      await test();
    });
  });

  describe('remove', () => {
    it('removes pulled bundle', async () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });
        expect(await runtime.exists(bundle)).to.eql(false);

        await uploadBundle(client, bundle);
        await runtime.pull(bundle, { silent: true });
        expect(await runtime.exists(bundle)).to.eql(true);

        expect((await runtime.remove(bundle)).count).to.eql(1);
        expect((await runtime.remove(bundle)).count).to.eql(0); // NB: Nothing removed (already removed on last line)
        expect(await runtime.exists(bundle)).to.eql(false);

        await mock.dispose();
      };

      await test('foobar');
      await test();
    });

    it('does nothing when non-existant bundle removed', async () => {
      const { mock, runtime, bundle } = await prepare();
      expect(await runtime.exists(bundle)).to.eql(false);
      await runtime.remove(bundle);
      await mock.dispose();
    });
  });

  describe('clear', () => {
    it('nothing to clear', async () => {
      const { mock, runtime } = await prepare();
      expect((await runtime.clear()).count).to.eql(0);
      await mock.dispose();
    });

    it('removes all pulled bundles', async () => {
      const { mock, runtime, client, uri } = await prepare();
      const host = mock.host;

      const bundle1: B = { host, uri, dir: 'foo' };
      const bundle2: B = { host, uri, dir: 'bar' };
      const bundle3: B = { host, uri };

      await uploadBundle(client, bundle1);
      await uploadBundle(client, bundle2);
      await uploadBundle(client, bundle3);

      expect(await runtime.exists(bundle1)).to.eql(false);
      expect(await runtime.exists(bundle2)).to.eql(false);
      expect(await runtime.exists(bundle3)).to.eql(false);

      await runtime.pull(bundle1, { silent: true });
      await runtime.pull(bundle2, { silent: true });
      await runtime.pull(bundle3, { silent: true });

      expect(await runtime.exists(bundle1)).to.eql(true);
      expect(await runtime.exists(bundle2)).to.eql(true);
      expect(await runtime.exists(bundle3)).to.eql(true);

      expect((await runtime.clear()).count).to.eql(3);
      expect((await runtime.clear()).count).to.eql(0);

      expect(await runtime.exists(bundle1)).to.eql(false);
      expect(await runtime.exists(bundle2)).to.eql(false);
      expect(await runtime.exists(bundle3)).to.eql(false);

      await mock.dispose();
    });
  });

  describe.only('run', () => {
    it('auto pulls before run', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      expect(await runtime.exists(bundle)).to.eql(false);
      await runtime.run(bundle, { silent: true });
      expect(await runtime.exists(bundle)).to.eql(true);

      await mock.dispose();
    });

    it('return value / default entry / no process leaks', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = { value: { foo: 123 } };
      const res = await runtime.run(bundle, { silent: true, params });
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(res.entry).to.eql('main.js');
      expect(res.errors.length).to.eql(0);

      const result = res.result as Result;
      expect(result.echo).to.eql({ foo: 123 });
      expect(result.process).to.eql({}); // NB: Process env-variables not leaked.
    });

    it('immediate', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = {};
      const res1 = await runtime.run(bundle, { silent: true, params });
      const res2 = await runtime.run(bundle, { silent: true, params });
      await mock.dispose();

      expect(res1.elapsed.prep).to.greaterThan(res2.elapsed.prep); // NB: Compiled script is re-used (faster second time).
    });

    it('delay', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = { value: { foo: 123 } };
      const res1 = await runtime.run(bundle, { silent: true, params: { ...params, id: 1 } });
      const res2 = await runtime.run(bundle, { silent: true, params: { ...params, id: 2 } });
      const res3 = await runtime.run(bundle, {
        silent: true,
        params: { ...params, delay: 60, id: 3 },
      });
      await mock.dispose();

      expect(res1.elapsed.prep).to.greaterThan(res2.elapsed.prep); // NB: Compiled script is re-used (faster second time).

      expect(res3.ok).to.eql(true);
      expect(res3.errors.length).to.eql(0);
      expect((res3.result as Result).echo).to.eql({ foo: 123 });

      expect(res2.elapsed.run).to.lessThan(15);
      expect(res3.elapsed.run).to.greaterThan(60);
    });

    it('error: timed out', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = { value: { foo: 123 }, delay: 20 };
      const res = await runtime.run(bundle, { silent: true, params, timeout: 10 });
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);
      expect(res.result).to.eql(undefined);

      const error = res.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.include('Execution timed out (max 10ms)');
    });

    it('done is only called once', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = { repeatDone: 5 };
      const res = await runtime.run(bundle, { silent: true, params });
      await mock.dispose();

      expect(res.result).to.eql({ count: 1 });
    });

    it('error: thrown within bundled code', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = { throwError: 'echo error' };
      const res = await runtime.run(bundle, { silent: true, params });
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);

      const error = res.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.eql('echo error');
      expect(error.stack).to.include('cell-foo-A1/dir.foo/main.js');
    });

    it('custom entry', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);

      const params: EntryParams = {};
      const entry = '  dev.js  '; // NB: space padding is removed.

      const res = await runtime.run(bundle, { silent: true, params, entry });
      await mock.dispose();

      expect(res.entry).to.eql('dev.js');

      const result = res.result as Result;
      expect(result?.echo).to.eql('hello dev');
    });

    it('hash: valid', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      const { manifest } = await uploadBundle(client, bundle);
      const hash = manifest.hash;
      expect(hash).to.not.eql(undefined);

      const res = await runtime.run(bundle, { silent: true, hash });
      await mock.dispose();

      expect(res.ok).to.eql(true); // NB: Given hash matches.
      expect(res.errors).to.eql([]);
    });

    it('hash: invalid (error)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, bundle);
      const hash = 'foobar-fail';

      const res = await runtime.run(bundle, { silent: true, hash });
      await mock.dispose();

      expect(res.ok).to.eql(false); // NB: Given hash matches.
      expect(res.errors.length).to.eql(1);

      const error = res.errors[0];
      expect(error.message).to.include('undle manifest does not match requested hash');
      expect(error.message).to.include(hash);
    });

    it.skip('pipe: seqential execution list', async () => {
      //
    });

    it.skip('pipe: parallel execution', async () => {
      //
    });

    it('error: no manifest in bundle (caught during pull)', async () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });

        await uploadBundle(client, bundle, { filter: noManifest });

        const res = await runtime.run(bundle, { silent: true });
        const error = res.errors[0];
        await mock.dispose();

        expect(res.ok).to.eql(false);
        expect(res.elapsed).to.eql({ prep: -1, run: -1 });
        expect(res.errors.length).to.eql(1);
        expect(error.type).to.eql('RUNTIME/pull');
        expect(error.message).to.include('The bundle does not contain a manifest');
        expect(error.bundle).to.eql(bundle);
      };

      await test('foo');
      await test('foo/bar');
      await test();
    });
  });
});
