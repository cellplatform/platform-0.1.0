import { Subject } from 'rxjs';

import { TreeViewNavigation } from '.';
import { TreeState } from '../state';
import { expect, t } from '../test';

type N = t.ITreeViewNode;

const create = (root?: N) => {
  root = root ? { ...root } : root;
  const treeview$ = new Subject<t.TreeViewEvent>();
  const tree = TreeState.create({ root });
  return TreeViewNavigation.create({ treeview$, tree });
};

describe('TreeViewNavigation', () => {
  it('create (current as root node)', () => {
    const tree = create();
    expect(tree.isDisposed).to.eql(false);
    expect(tree.current).to.eql(tree.root.id);
    expect(tree.selected).to.eql(undefined);
  });

  it('query', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2' }],
    };
    const query = create(root).query;
    expect(query.findById('child-2')?.id).to.match(/child-2$/);
    expect(query.findById('404')).to.eql(undefined);
  });

  it('change: current/selection', () => {
    const tree = create();
    expect(tree.current).to.eql(tree.root.id);
    expect(tree.selected).to.eql(undefined);

    const changed: t.ITreeViewNavigationChanged[] = [];
    tree.changed$.subscribe((e) => changed.push(e));

    tree.current = 'foo';
    expect(changed.length).to.eql(1);

    tree.selected = 'bar';
    expect(changed.length).to.eql(2);

    expect(changed[0].to.nav.current).to.eql('foo');
    expect(changed[1].to.nav.selected).to.eql('bar');

    expect(tree.current).to.eql('foo');
    expect(tree.selected).to.eql('bar');
  });

  describe('node', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
    };

    it('node: not found', () => {
      const tree = create(root);
      expect(tree.node()).to.eql(undefined);
      expect(tree.node('404')).to.eql(undefined);
    });

    it('node: found', () => {
      const tree = create(root);
      const node = tree.node('child-2');
      expect(node?.id).to.match(/child-2$/);
    });

    it('node: change', () => {
      const tree = create(root);
      expect(tree.query.findById('child-2')?.props).to.eql(undefined);

      const res = tree.node('child-2', (node) => {
        TreeViewNavigation.props(node, (props) => (props.icon = 'face'));
      });

      expect(res?.id).to.match(/child-2$/);
      expect(res?.props).to.eql({ icon: 'face' });
      expect(tree.query.findById('child-2')?.props).to.eql({ icon: 'face' });
    });
  });
});
