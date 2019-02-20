import { expect } from 'chai';
import { createStore } from '../store';
import { StoreInternal, topDown } from '.';

interface IMyState {
  text: string;
}
type IMyActions = IFooAction;
interface IFooAction {
  type: 'FOO';
  payload: {};
}

type MyStoreInternal = StoreInternal<IMyState, IMyActions>;

function createTestHierarchy() {
  const root = createStore<IMyState, IMyActions>({
    text: 'root',
  });
  const child = createStore<IMyState, IMyActions>({ text: 'child' });
  const grandchild = createStore<IMyState, IMyActions>({
    text: 'grandchild',
  });
  root.add('child', child);
  child.add('grandchild', grandchild);

  return {
    rootInternal: root as MyStoreInternal,
    root,
    child,
    grandchild,
  };
}

/**
 * TESTS
 */
describe('dispatcher (helpers)', () => {
  it('topDown', () => {
    const { rootInternal, root, child, grandchild } = createTestHierarchy();

    const calls: Array<{ level: MyStoreInternal; levelIndex: number }> = [];
    topDown(rootInternal, (level: MyStoreInternal, levelIndex) => {
      calls.push({ level, levelIndex });
    });

    expect(calls.length).to.eql(3);
    expect(calls[0].level).to.eql(root);
    expect(calls[1].level).to.eql(child);
    expect(calls[2].level).to.eql(grandchild);

    expect(calls[0].levelIndex).to.eql(0);
    expect(calls[1].levelIndex).to.eql(1);
    expect(calls[2].levelIndex).to.eql(2);
  });
});
