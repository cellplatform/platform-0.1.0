import { NodeRuntime } from '@platform/cell.runtime.node';
import { createMock, expect, fs, Http, readFile, Schema, t } from '../../test';
import { CompileSamples } from '../CompileSamples';

type B = t.RuntimeBundleOrigin;

const DIR = {
  NODE: CompileSamples.node.outdir,
  TMP_RUNTIME: 'tmp/runtime.node',
};

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
  let files = await bundleToFiles(DIR.NODE, bundle.dir);
  files = filter ? files.filter((file) => filter(file)) : files;
  const upload = await client.files.upload(files);
  expect(upload.ok).to.eql(true);
  return { files, upload, bundle };
};

describe('NodeRuntime', function () {
  this.timeout(99999);

  /**
   * Ensure the sample [node] code as been bundled.
   */
  before(async () => CompileSamples.node.bundle());
  beforeEach(async () => await fs.remove(fs.resolve(DIR.TMP_RUNTIME)));

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

    it('empty list', async () => {
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

  describe('run', () => {
    it('run', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });

      await uploadBundle(client, bundle);
      expect(await runtime.exists(bundle)).to.eql(false);
      // await runtime.pull(bundle, { silent: true });

      const res = await runtime.run(bundle, { silent: true });
      expect(await runtime.exists(bundle)).to.eql(true);

      console.log('-------------------------------------------');
      console.log('test/run :: res', res.ok);
      console.log('TODO', 'return data');
      console.log('TODO', 'params');

      await mock.dispose();
    });

    it('error: no manifest in bundle', async () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });

        const noManifest = (file: t.IHttpClientCellFileUpload) =>
          !file.filename.endsWith('index.json'); // NB: Cause error by filtering out the manifest file.

        await uploadBundle(client, bundle, { filter: noManifest });

        const res = await runtime.run(bundle, { silent: true });
        const error = res.errors[0];
        await mock.dispose();

        expect(res.ok).to.eql(false);
        expect(res.errors.length).to.eql(1);
        expect(error.message).to.include('A bundle manifest file does not exist');
        if (dir) {
          expect(error.message).to.include(`|cell:foo:A1|dir:${dir}]`);
        } else {
          expect(error.message).to.include(`|cell:foo:A1]`);
        }
      };

      await test('foo');
      await test('foo/bar');
      await test();
    });
  });
});
