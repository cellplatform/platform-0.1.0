import { expect } from 'chai';
import * as diff from './diff';

describe('Diff', () => {
  it('object: Edit', () => {
    const lhs = { foo: 123 };
    const rhs = { foo: 456 };

    const res = diff.compare(lhs, rhs);
    expect(res.length).to.eql(1);

    const item = res[0] as diff.DiffEdit<any>;
    expect(item.kind).to.eql('E');
    expect(item.path).to.eql(['foo']);
    expect(item.lhs).to.eql(123);
    expect(item.rhs).to.eql(456);
  });
});
