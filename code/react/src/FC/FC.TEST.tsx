import { expect } from '../test';
import React from 'react';
import { FC } from '.';

describe('FC (Functional Component)', () => {
  describe('FC.decorate', () => {
    it('assigns fields', () => {
      type FooProps = { count?: number };
      const View: React.FC<FooProps> = (props) => <div>{props.count}</div>;

      type F = { helper: () => boolean };
      const helper = () => true;
      const Foo = FC.decorate<FooProps, F>(View, { helper });

      expect(Foo).to.equal(View);
      expect(Foo.helper).to.eql(helper);
    });
  });
});
