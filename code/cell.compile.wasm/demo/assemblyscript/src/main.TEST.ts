import { expect } from 'chai';
import main from './main';

describe('AssemblyScript', () => {
  it('tmp', () => {
    const res = main.tmp([1, 2, 3]);
    console.log('-------------------------------------------');
    console.log('res', res);
  });

  it('add', () => {
    const res = main.add(1, 2);
    expect(res).to.eql(3);
  });
});
