import { expect } from 'chai';
import { StateObject } from '.';
import * as t from './types';

type IFoo = { message?: string; count: number };

describe('StateObject', () => {
  it('store initial state', () => {
    const initial = { count: 1 };
    const obj = StateObject.create<IFoo>(initial);

    expect(obj.state).to.eql(initial);
    expect(obj.original).to.eql(initial);

    expect(obj.state).to.not.equal(initial); // No change on initial.
    expect(obj.original).to.not.equal(initial); // No change on initial.
  });

  it('change', () => {
    const initial = { count: 1 };
    const obj = StateObject.create<IFoo>(initial);

    obj.change((draft) => {
      draft.count += 2;
      draft.message = 'hello';
    });
    obj.change((draft) => (draft.count += 1));

    expect(obj.original).to.eql(initial);
    expect(obj.state).to.eql({ count: 4, message: 'hello' });
  });

  it('event: changed', () => {
    const initial = { count: 1 };
    const obj = StateObject.create<IFoo>(initial);

    const fired: t.StateObjectEvent[] = [];
    const changed: t.IStateObjectChanged[] = [];
    obj.event$.subscribe((e) => fired.push(e));
    obj.changed$.subscribe((e) => changed.push(e));

    obj.change((draft) => {
      draft.count += 2;
      draft.message = 'hello';
    });

    expect(fired.length).to.eql(1);
    expect(changed.length).to.eql(1);

    expect(changed[0].from).to.eql(initial);
    expect(changed[0].to).to.eql({ count: 3, message: 'hello' });
    expect(changed[0].to).to.equal(obj.state); // Current state instance.
  });
});
