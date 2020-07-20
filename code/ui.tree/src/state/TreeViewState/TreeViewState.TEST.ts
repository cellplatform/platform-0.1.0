import { expect } from '../../test';
import { TreeViewState } from '.';

const S = TreeViewState;

describe('TreeViewState', () => {
  it('create and change', () => {
    const state = TreeViewState.create({ root: { id: 'foo', props: { label: 'Hello' } } });
    state.change((draft) => S.props(draft, (props) => (props.label = 'boom')));
    expect(state.root.props?.label).to.eql('boom');
  });
});
