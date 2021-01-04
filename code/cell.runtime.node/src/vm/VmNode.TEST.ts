import { expect } from '../test';
import { VmNode } from './VmNode';

/**
 * See [cell.router] for full set of tests.
 */
describe('VmNode', () => {
  it('create (default)', () => {
    const global = { foo: 1234 };
    const vm = VmNode.create({ global });

    const log = console.log;
    const logged: any[] = [];
    console.log = (p: any) => logged.push(p);

    const code = '(() => console.log(foo))()';
    const res = vm.run(code);

    console.log = log; // Restore console.

    expect(res).to.eql({});
    expect(logged).to.eql([1234]);
  });
});
