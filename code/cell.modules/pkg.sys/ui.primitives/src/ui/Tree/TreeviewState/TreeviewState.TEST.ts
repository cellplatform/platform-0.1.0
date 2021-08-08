import { expect } from '../../../test';
import { TreeviewState } from '.';

const S = TreeviewState;

describe('TreeviewState', () => {
  it('create and change', () => {
    const state = TreeviewState.create({
      root: { id: 'foo', props: { treeview: { label: 'Hello' } } },
    });
    state.change((draft) => S.props(draft, (props) => (props.label = 'boom')));
    expect(state.state.props?.treeview?.label).to.eql('boom');
  });
});
