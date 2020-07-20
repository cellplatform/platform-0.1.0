import { expect } from '../test';
import { TreeViewState } from '.';

const S = TreeViewState;

describe('TreeViewState', () => {
  it('create and change', () => {
    const state = TreeViewState.create({ root: 'foo' });
    state.change((draft) => S.props(draft, (props) => (props.label = 'hello')));
    expect(state.root.props?.label).to.eql('hello');
  });
});
