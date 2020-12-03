/**
 * https://github.com/patriksimek/vm2
 */

import { NodeVM, VMScript } from 'vm2';
import { fs, expect, TestCompile } from '../../test';
import { Global } from '../../test/TestCompile/sample.vm2/types';

describe('vm2 (lib)', function () {
  this.timeout(99999);
  before(async () => compileTestBundle());

  const filename = fs.join(fs.resolve(TestCompile.vm2.outdir), 'main.js');
  const compileTestBundle = (force?: boolean) => TestCompile.vm2.bundle(force);
  const readCode = async () => (await fs.readFile(filename)).toString();

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
    });

    return { vm, results, sandbox };
  };

  it('NodeVM', async () => {
    // await compileTestBundle(true);

    const code = await readCode();
    const { vm, results } = testVm({ count: 123 });

    const res = vm.run(code, filename);
    expect(res).to.eql({});

    expect(results.length).to.eql(2);
    expect(results[0].msg).to.eql('app');
    expect(results[1].msg).to.eql('main');

    expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
    expect(results[1].env).to.eql({});

    expect(results[0].foo).to.eql({ count: 123 });
    expect(results[1].foo).to.eql({ count: 123 });
  });

  it('VMScript ', async () => {
    // await compileTestBundle(true);

    const code = await readCode();
    const { vm, results } = testVm({ count: 456 });

    const script = new VMScript(code, { filename });
    const res = vm.run(script as any);
    expect(res).to.eql({});

    expect(results.length).to.eql(2);
    expect(results[0].msg).to.eql('app');
    expect(results[1].msg).to.eql('main');

    expect(results[0].env).to.eql({}); // NB: No environment variables leak into the context.
    expect(results[1].env).to.eql({});

    expect(results[0].foo).to.eql({ count: 456 });
    expect(results[1].foo).to.eql({ count: 456 });
  });
});
