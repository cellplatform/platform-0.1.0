import { expect } from 'chai';
import { graphql } from '..';
import { clone } from 'ramda';

describe('graphql util', () => {
  describe('clean', () => {
    const example = {
      __typename: 'MyType',
      msg: 'hello',
      child: {
        count: 123,
        __typename: 'MyChildType',
      },
      list: [{ foo: 123, __typename: 'MyFooType' }],
    };

    it('removes fields deeply', () => {
      const obj = clone(example);
      const res = graphql.clean(obj);
      expect(res).to.eql({ msg: 'hello', child: { count: 123 }, list: [{ foo: 123 }] });
    });

    it('removes fields shallow', () => {
      const obj = clone(example);
      const res = graphql.clean(obj, { deep: false });
      expect(res).to.eql({
        msg: 'hello',
        child: { count: 123, __typename: 'MyChildType' },
        list: [{ foo: 123, __typename: 'MyFooType' }],
      });
    });
  });
});
