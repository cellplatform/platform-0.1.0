import { firstValueFrom, timeout } from 'rxjs';
import { delay, filter } from 'rxjs/operators';

import { Compiler, expect, fs, rx, Schema, t, TestCompile } from '../../test';
import { ISampleNodeInValue, ISampleNodeOutValue } from './sample.NodeRuntime/types';
import { getManifest, noManifestFilter, prepare, uploadBundle } from './util';

type B = t.RuntimeBundleOrigin;
type E = { type: 'foo'; payload: { count: number } };

const ENTRY = {
  NODE: './src/tests/module.cell.runtime.node/sample.NodeRuntime',
  PIPE: './src/tests/module.cell.runtime.node/sample.pipe',
  V1: './src/tests/module.cell.runtime.node/sample.v1',
  V2: './src/tests/module.cell.runtime.node/sample.v2',
  LONG_RUNNING: './src/tests/module.cell.runtime.node/sample.longrunning',
};

export const Samples = {
  node: TestCompile.make(
    'NodeRuntime',
    Compiler.config('NodeRuntime')
      .namespace('sample')
      .target('node')
      .entry(`${ENTRY.NODE}/main`)
      .entry('dev', `${ENTRY.NODE}/dev`)
      .entry('web', `${ENTRY.NODE}/web`)
      .entry('wasm', `${ENTRY.NODE}/wasm`)
      .static(`${ENTRY.NODE}/static`),
  ),

  pipe: TestCompile.make(
    'pipe',
    Compiler.config('pipe').namespace('sample').target('node').entry(`${ENTRY.PIPE}/main`),
  ),

  longRunning: TestCompile.make(
    'longrunning',
    Compiler.config().namespace('longrunning').target('node').entry(`${ENTRY.LONG_RUNNING}/main`),
  ),

  v1: TestCompile.make(
    'sample-v1',
    Compiler.config()
      .namespace('sample.version')
      .version('1.0.0')
      .target('node')
      .entry(`${ENTRY.V1}/main`),
  ),

  v2: TestCompile.make(
    'sample-v2',
    Compiler.config()
      .namespace('sample.version')
      .version('2.0.0')
      .target('node')
      .entry(`${ENTRY.V2}/main`),
  ),
};

describe('cell.runtime.node: NodeRuntime', function () {
  this.timeout(999999);

  /**
   * Ensure the sample [node] code as been bundled.
   */
  before(async () => {
    const force = false;
    await Samples.node.bundle(force);
  });

  describe('pull', () => {
    const test = async (dir?: string) => {
      const { mock, runtime, bundle, client } = await prepare({ dir });
      expect(await runtime.exists(bundle)).to.eql(false);

      await uploadBundle(client, Samples.node.outdir, bundle);
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

        await uploadBundle(client, Samples.node.outdir, bundle, { filter: noManifestFilter });

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

        await uploadBundle(client, Samples.node.outdir, bundle);
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
      await fs.remove(fs.resolve('tmp/runtime.node'));
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

      await uploadBundle(client, Samples.node.outdir, bundle1);
      await uploadBundle(client, Samples.node.outdir, bundle2);
      await uploadBundle(client, Samples.node.outdir, bundle3);

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
    it('auto pulls before run', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      expect(await runtime.exists(bundle)).to.eql(false);

      await runtime.run(bundle, { silent: true });

      expect(await runtime.exists(bundle)).to.eql(true);

      await mock.dispose();
    });

    it('pull (replace cached)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });

      type Out = { version: string };
      const toVersion = (res: t.RuntimeRunResponse) => (res.out.value as Out).version;

      const force = false;
      await Samples.v1.bundle(force);
      await Samples.v2.bundle(force);

      await uploadBundle(client, Samples.v1.outdir, bundle);

      const res1 = await runtime.run(bundle, { silent: true });

      await uploadBundle(client, Samples.v2.outdir, bundle);

      const res2 = await runtime.run(bundle, { silent: true }); // NB: Proves caching is working.
      const res3 = await runtime.run(bundle, { silent: true, pull: true }); // NB: Stamps on cache.
      await mock.dispose();

      expect(res1.manifest?.module.version).to.eql('1.0.0');
      expect(res2.manifest?.module.version).to.eql('1.0.0'); // NB: cached version (not force pulled).
      expect(res3.manifest?.module.version).to.eql('2.0.0');

      expect(toVersion(res1)).to.eql('🐬-1.0.0');
      expect(toVersion(res2)).to.eql('🐬-1.0.0'); // NB: cached version (not force pulled).
      expect(toVersion(res3)).to.eql('🐬-2.0.0');
    });

    it('tx (process id)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const promise = runtime.run(bundle, { silent: true });
      const res = await promise;
      const out = res.out as any;

      expect(typeof promise.tx === 'string').to.eql(true);
      expect(promise.tx.length).to.greaterThan(5);
      expect(promise.tx).to.eql(res.tx);
      expect(promise.tx).to.eql(out.value?.env?.tx); // NB: "tx" passed into env (accessible to executing code).

      await mock.dispose();
    });

    it('uses default entry (from manifest)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { value: { foo: 123 } };
      const res = await runtime.run(bundle, { silent: true, in: { value } });
      await mock.dispose();

      expect(res.entry).to.eql('main.js');
    });

    it('out: value / no process leaks / immutable', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { value: { foo: 123 } };
      const res = await runtime.run(bundle, { silent: true, in: { value } });
      await mock.dispose();

      value.value.foo = 456; // NB: Mutate the value (should not be transferred within the function)

      expect(res.ok).to.eql(true);
      expect(res.errors.length).to.eql(0);

      const result = res.out.value as ISampleNodeOutValue;
      expect(result.echo).to.not.equal(value.value); // NB: Different instance from input.
      expect(result.echo).to.eql({ foo: 123 }); // NB: The mutated input was not returned.
      expect(result.process).to.eql({}); // NB: Process env-variables not leaked.
    });

    it('out: headers (contentType, contentDef)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const test = async (value: ISampleNodeInValue, expected?: t.RuntimeInfoHeaders) => {
        const res = await runtime.run(bundle, { silent: true, in: { value } });
        expect(res.out.info.headers).to.eql(expected);
      };

      await test({}, { contentType: 'application/json' });
      await test({ setContentType: 'text/html' }, { contentType: 'text/html' });
      await test(
        { setContentDef: 'cell:foo:A1' },
        { contentType: 'application/json', contentDef: 'cell:foo:A1' },
      );

      await mock.dispose();
    });

    it('immediate', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = {};
      const res1 = await runtime.run(bundle, { silent: true, in: { value } });
      const res2 = await runtime.run(bundle, { silent: true, in: { value } });
      await mock.dispose();

      expect(res1.elapsed.prep).to.greaterThan(res2.elapsed.prep); // NB: Compiled script is re-used (faster second time).
    });

    it('delay', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { value: { foo: 123 } };
      const res1 = await runtime.run(bundle, {
        silent: true,
        in: { value: { ...value, id: 1 } },
      });
      const res2 = await runtime.run(bundle, {
        silent: true,
        in: { value: { ...value, id: 2 } },
      });
      const res3 = await runtime.run(bundle, {
        silent: true,
        in: { value: { ...value, delay: 60, id: 3 } },
      });
      await mock.dispose();

      expect(res1.elapsed.prep).to.greaterThan(res2.elapsed.prep); // NB: Compiled script is re-used (faster second time).

      expect(res3.ok).to.eql(true);
      expect(res3.errors.length).to.eql(0);
      expect((res3.out.value as ISampleNodeOutValue).echo).to.eql({ foo: 123 });

      expect(res2.elapsed.run).to.lessThan(20);
      expect(res3.elapsed.run).to.greaterThan(60);
    });

    it('env.bus', async () => {
      const prep = await prepare({ dir: 'foo' });
      const bus = rx.busAsType<E>(prep.bus);
      const { mock, runtime, bundle, client } = prep;
      await uploadBundle(client, Samples.node.outdir, bundle);

      type L = t.RuntimeNodeProcessLifecycleEvent;
      let events: (E | L)[] = [];
      bus.$.subscribe((e) => events.push(e));

      const run = (repeatDone?: number) => {
        const value: ISampleNodeInValue = { repeatDone };
        return runtime.run(bundle, { silent: true, in: { value } });
      };

      await run();

      expect(events.length).to.eql(3);
      expect(events[0].type === 'cell.runtime.node/lifecycle').to.eql(true);
      expect(events[1].type === 'foo').to.eql(true);
      expect(events[2].type === 'cell.runtime.node/lifecycle').to.eql(true);

      events = [];
      await run(5);
      await mock.dispose();

      const foos = events.filter((e) => e.type === 'foo').map((e) => e.payload as E['payload']);

      expect(foos.length).to.eql(5);
      expect(foos.map((e) => e.count)).to.eql([1, 2, 3, 4, 5]);
    });

    it('timeout', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const run = (timeout?: t.RuntimeRunOptions['timeout']) => {
        const value: ISampleNodeInValue = { value: { foo: 123 }, delay: 100 };
        return runtime.run(bundle, { silent: true, in: { value }, timeout });
      };

      const res0 = await run(); //        NB: default (3 seconds)
      const res1 = await run(-1); //      NB: -1 indicates never timeout.
      const res2 = await run(-999); //    NB: converts to -1
      const res3 = await run('never'); // NB: "never" converts to -1.
      await mock.dispose();

      expect(res0.timeout).to.eql(3000);

      expect(res1.ok).to.eql(true);
      expect(res1.elapsed.run).to.greaterThan(90);
      expect(res1.timeout).to.eql(-1);

      expect(res2.timeout).to.eql(-1);

      expect(res3.ok).to.eql(true);
      expect(res3.elapsed.run).to.greaterThan(90);
      expect(res3.timeout).to.eql(-1);
    });

    it('timed out (error)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { value: { foo: 123 }, delay: 20 };
      const res = await runtime.run(bundle, { silent: true, in: { value }, timeout: 10 });
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);
      expect(res.out.value).to.eql(undefined);

      const error = res.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.include('Execution timed out (max 10ms)');
    });

    it('done is only called once', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { repeatDone: 5 };
      const res = await runtime.run(bundle, { silent: true, in: { value } });
      await mock.dispose();

      expect(res.out.value).to.eql({ count: 1 });
    });

    it('error: thrown within bundled code (standard errors)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { throwError: 'echo error' };
      const res = await runtime.run(bundle, { silent: true, in: { value } });
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);

      const error = res.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.eql('echo error');
      expect(error.stack).to.include('cell-foo-A1/dir.foo/main.js');
    });

    it('custom entry path', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const value: ISampleNodeInValue = {};
      const entry = '  ///dev.js  '; // NB: space padding is removed and "/" trimmed.

      const res = await runtime.run(bundle, { silent: true, in: { value }, entry });
      await mock.dispose();

      expect(res.entry).to.eql('dev.js');

      const result = res.out.value as ISampleNodeOutValue;
      expect(result?.echo).to.eql('hello dev');
    });

    it('hash: valid', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      const { files } = await uploadBundle(client, Samples.node.outdir, bundle);
      const manifest = getManifest(files);
      const hash = manifest.hash.files;

      expect(hash).to.not.eql(undefined);

      const res = await runtime.run(bundle, { silent: true, hash });
      await mock.dispose();

      expect(res.ok).to.eql(true); // NB: Given hash matches.
      expect(res.errors).to.eql([]);
    });

    it('hash: invalid (error)', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);
      const hash = 'foobar-fail';

      const res = await runtime.run(bundle, { silent: true, hash });
      await mock.dispose();

      expect(res.ok).to.eql(false); // NB: Given hash matches.
      expect(res.errors.length).to.eql(1);

      const error = res.errors[0];
      expect(error.message).to.include('undle manifest does not match requested hash');
      expect(error.message).to.include(hash);
    });

    it('error: no manifest in bundle (caught during pull)', async () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });

        await uploadBundle(client, Samples.node.outdir, bundle, { filter: noManifestFilter });

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

  describe('bus (events)', () => {
    it('lifecycle: "started" => "completed"', async () => {
      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.node.outdir, bundle);

      const events: t.RuntimeNodeProcessLifecycle[] = [];
      runtime.events.process.lifecycle.$.subscribe((e) => events.push(e));

      await runtime.run(bundle, { silent: true, in: { value: {} } });
      await mock.dispose();

      expect(events.length).to.eql(2);
      expect(events[0].runtime).to.eql(runtime.id);

      expect(events[0].stage).to.eql('started');
      expect(events[1].stage).to.eql('completed:ok');
    });

    it('lifecycle$', async () => {
      const force = false;
      await Samples.longRunning.bundle(force);

      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.longRunning.outdir, bundle);

      const info1 = await runtime.events.info.get();
      expect(info1.runtime).to.eql(runtime.id);
      expect(info1.info?.processes.length).to.eql(0);

      const process = runtime.run(bundle, { silent: true, timeout: 50 });
      await firstValueFrom(process.start$);

      const info2 = await runtime.events.info.get();
      const processes = info2.info?.processes ?? [];
      expect(processes.length).to.eql(1);
      expect(processes[0].info.tx).to.eql(process.tx);

      const done = await firstValueFrom(process.end$);
      await mock.dispose();

      expect(done.stage).to.eql('completed:error'); // Timeout
      expect(done.is.ended).to.eql(true);
      expect(done.is.ok).to.eql(false);
    });

    it('kill', async () => {
      const force = false;
      await Samples.longRunning.bundle(force);

      const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });
      await uploadBundle(client, Samples.longRunning.outdir, bundle);

      const process = runtime.run(bundle, { silent: true, timeout: 'never' });
      await firstValueFrom(process.start$);

      const info1 = await runtime.events.info.get();
      expect(info1.info?.processes.length).to.eql(1);

      const killed = await runtime.events.process.kill.fire(process.tx);
      const res = await process;

      await mock.dispose();

      expect(killed.runtime).to.eql(runtime.id);
      expect(killed.elapsed).to.greaterThan(1);
      expect(killed.process?.tx).to.eql(process.tx);
      expect(killed.process?.manifest?.module.namespace).to.eql('longrunning');

      expect(res.ok).to.eql(false);
      expect(res.errors[0].message).to.include('Process killed');
      expect(res.elapsed.run).to.eql(killed.elapsed);
    });
  });
});
