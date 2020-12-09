/**
 * https://github.com/patriksimek/vm2
 */

import { NodeVM, VMScript } from 'vm2';
import { fs, expect, TestCompile, Compiler, time } from '../../test';
import { Global } from './sample.vm2/types';

const ENTRY = './src/tests/module.cell.runtime.node/sample.vm2';

const make = (name: string) => {
  return TestCompile.make(
    `node.vm2/${name}`,
    Compiler.config(name)
      .namespace('sample')
      .target('node')
      .shared((e) => e.add('@platform/log'))
      .entry(`${ENTRY}/${name}/main`),
  );
};

const samples = {
  single: make('single-file'),
  dynamic: make('dynamic-import'),
};

/**
 * Make the dynamic import configuration a little more complex.
 */
samples.dynamic.config
  .entry('dev', `${ENTRY}/dynamic-import/dev`)
  .expose('./app', `${ENTRY}/dynamic-import/app`)
  .expose('./main', `${ENTRY}/dynamic-import/main`);

describe('cell.runtime.node: vm2 (lib) - secure runtime checks', function () {
  this.timeout(999999);

  before(async () => {
    const force = false;
    await Promise.all([
      samples.single.bundle(force),
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
        root: './',
        context: 'sandbox',
        builtin: ['os', 'tty', 'util'],
        external: true,
      },
    });

    return { vm, results, sandbox };
  };

  describe('single-file', () => {
    const filename = fs.join(fs.resolve(samples.single.outdir), 'main.js');

    it('NodeVM', async () => {
      const { vm, results } = testVm({ count: 123 });
      const code = fs.readFileSync(filename).toString();

      const res = vm.run(code, filename);
      expect(res).to.eql({});

      expect(results.length).to.eql(2);
      expect(results[0].msg).to.eql('single-file/app');
      expect(results[1].msg).to.eql('single-file/main');

      expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
      expect(results[1].env).to.eql({});

      expect(results[0].foo).to.eql({ count: 123 });
      expect(results[1].foo).to.eql({ count: 123 });
    });

    it('VMScript ', async () => {
      const { vm, results } = testVm({ count: 456 });
      const code = fs.readFileSync(filename).toString();

      const script = new VMScript(code, { filename });
      const res = vm.run(script as any);
      expect(res).to.eql({});

      expect(results.length).to.eql(2);
      expect(results[0].msg).to.eql('single-file/app');
      expect(results[1].msg).to.eql('single-file/main');

      expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
      expect(results[1].env).to.eql({});

      expect(results[0].foo).to.eql({ count: 456 });
      expect(results[1].foo).to.eql({ count: 456 });
    });
  });

  describe('dynamic-import', () => {
    it('NodeVM', async () => {
      const { vm, results } = testVm({ count: 123 });
      const filename = fs.join(fs.resolve(samples.dynamic.outdir), 'main.js');
      const code = fs.readFileSync(filename).toString();

      const res = vm.run(code, filename);
      expect(res).to.eql({});

      expect(results.length).to.eql(1);
      expect(results[0].msg).to.eql('dynamic-import/main');

      await time.wait(20); // NB: Wait for dynamic import to complete.

      expect(results.length).to.eql(2);
      expect(results[1].msg).to.eql('dynamic-import/app');

      expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
      expect(results[1].env).to.eql({});

      expect(results[0].foo).to.eql({ count: 123 });
      expect(results[1].foo).to.eql({ count: 123 });
    });

    it('run secondary entry (as VMScript)', async () => {
      const { vm, results } = testVm({ count: 888 });
      const filename = fs.join(fs.resolve(samples.dynamic.outdir), 'dev.js');
      const code = fs.readFileSync(filename).toString();

      const script = new VMScript(code, { filename }).compile(); // Optional (compiles on first call).
      const res = vm.run(script as any);
      expect(res).to.eql({});

      expect(results.length).to.eql(2);
      expect(results[0].msg).to.eql('dynamic-import/app');
      expect(results[1].msg).to.eql('hello');

      expect(results[0].env).to.eql({});
      expect(results[1].env).to.eql({});

      expect(results[0].foo).to.eql({ count: 888 });
      expect(results[1].foo).to.eql({ count: 888 });
    });
  });
});
