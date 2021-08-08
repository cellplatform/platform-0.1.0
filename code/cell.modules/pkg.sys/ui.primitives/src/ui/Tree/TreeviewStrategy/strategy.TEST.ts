import { Subject } from 'rxjs';

import { TreeviewStrategy } from '.';
import { t, expect } from '../../../test';
import { TreeviewState } from '../TreeviewState';

type A = t.TreeviewStrategyNextArgs;

const create = {
  event() {
    const event: t.ITreeviewFocusEvent = {
      type: 'TREEVIEW/focus',
      payload: { isFocused: true, tag: '' },
    };
    return event;
  },

  tree() {
    return TreeviewState.create();
  },

  next() {
    const tree = create.tree();
    const event = create.event();
    return { tree, event };
  },

  strategy() {
    const subject$ = new Subject<A>();
    const strategy: t.ITreeviewStrategy = {
      next(args) {
        subject$.next(args);
      },
    };

    const fired: A[] = [];
    subject$.subscribe((e) => fired.push(e));

    return { subject$, strategy, fired };
  },
};

describe('strategy', () => {
  describe('merge', () => {
    it('no strategies', () => {
      const strategy = TreeviewStrategy.merge();
      strategy.next(create.next()); // NB: no error (nothing happens).
    });

    it('fires all strategies', () => {
      const test1 = create.strategy();
      const test2 = create.strategy();

      const strategy = TreeviewStrategy.merge(test1.strategy, test2.strategy);
      strategy.next(create.next());

      expect(test1.fired.length).to.eql(1);
      expect(test2.fired.length).to.eql(1);
    });

    it('merge a "merged" strategy', () => {
      const test1 = create.strategy();
      const test2 = create.strategy();
      const test3 = create.strategy();

      const merge1 = TreeviewStrategy.merge(test1.strategy, test2.strategy);
      const merge2 = TreeviewStrategy.merge(merge1, test3.strategy);

      merge2.next(create.next());

      expect(test1.fired.length).to.eql(1);
      expect(test2.fired.length).to.eql(1);
      expect(test3.fired.length).to.eql(1);
    });
  });
});
