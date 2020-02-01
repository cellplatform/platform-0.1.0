import { expect } from 'chai';
import main from './main';

describe('AssemblyScript', () => {
  it('add', () => {
    const res = main.add(1, 2);
    expect(res).to.eql(3);
  });
});
