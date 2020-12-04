/**
 * https://github.com/patriksimek/vm2
 */

import { NodeVM, VMScript } from 'vm2';
import { fs, expect, TestCompile, Compiler } from '../../test';
import { Global } from './sample.vm2/types';

const make = (name: string) => {
  return TestCompile.make(
    `node.vm2/${name}`,
    Compiler.config(name)
      .namespace('sample')
      .target('node')
      .shared((e) => e.add('@platform/log'))
      .entry(`./src/tests/test.cell.runtime.node/sample.vm2/${name}/main`),
  );
};

const samples = {
  sync: make('sync'),
  dynamic: make('dynamic'),
};

describe('cell.runtime.node: vm2 (lib)', function () {
  this.timeout(99999);

  before(async () => {
    const force = false;
    await Promise.all([
      samples.sync.bundle(force),
      samples.dynamic.bundle(force),
      //
    ]);
  });

  const testVm = (foo: Global['foo']) => {
    const results: any[] = [];
    const sandbox: Global = {
      foo,
      res: (value: any) => results.push(value),
    };

    const vm = new NodeVM({
      console: 'off',
      sandbox,
      require: {
        external: true,
        builtin: ['os', 'tty', 'util'],
        root: './',
      },
      nesting: false,
    });

    return { vm, results, sandbox };
  };

  describe('sync', () => {
    const filename = fs.join(fs.resolve(samples.sync.outdir), 'main.js');

    it('NodeVM', async () => {
      // await compileTestBundle(true);

      const { vm, results } = testVm({ count: 123 });
      const code = fs.readFileSync(filename).toString();

      const res = vm.run(code, filename);
      expect(res).to.eql({});

      expect(results.length).to.eql(2);
      expect(results[0].msg).to.eql('sync/app');
      expect(results[1].msg).to.eql('sync/main');

      expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
      expect(results[1].env).to.eql({});

      expect(results[0].foo).to.eql({ count: 123 });
      expect(results[1].foo).to.eql({ count: 123 });
    });

    it('VMScript ', async () => {
      // await compileTestBundle(true);

      const { vm, results } = testVm({ count: 456 });
      const code = fs.readFileSync(filename).toString();

      const script = new VMScript(code, { filename });
      const res = vm.run(script as any);
      expect(res).to.eql({});

      expect(results.length).to.eql(2);
      expect(results[0].msg).to.eql('sync/app');
      expect(results[1].msg).to.eql('sync/main');

      expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
      expect(results[1].env).to.eql({});

      expect(results[0].foo).to.eql({ count: 456 });
      expect(results[1].foo).to.eql({ count: 456 });
    });
  });

  describe('dynamic', () => {
    const filename = fs.join(fs.resolve(samples.dynamic.outdir), 'main.js');

    /**
     * POSSIBLE SECURITY LEAK:
     * https://github.com/patriksimek/vm2/issues/329
     */

    it.skip('NodeVM', async () => {
      const { vm, results } = testVm({ count: 123 });
      const code = fs.readFileSync(filename).toString();

      const res = vm.run(code, filename);
      expect(res).to.eql({});

      console.log('-------------------------------------------');
      console.log('results', results);
    });
  });
});
