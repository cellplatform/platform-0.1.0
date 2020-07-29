import { TreeState } from '@platform/state/lib/TreeState';
import { Subject } from 'rxjs';

import { TreeViewNavigation } from '.';
import { expect, t } from '../test';

type N = t.ITreeViewNode;

const treeview$ = new Subject<t.TreeViewEvent>();
const create = (root?: N) => {
  root = root ? { ...root } : root;
  const tree = TreeState.create({ root });
  return TreeViewNavigation.create({ treeview$, tree });
};

describe('TreeViewNavigation', () => {
  it('create: current as root node', () => {
    const nav = create();
    expect(nav.isDisposed).to.eql(false);
    expect(nav.current).to.eql(nav.root.id);
    expect(nav.selected).to.eql(undefined);
  });

  it('create: without tree in constructor', () => {
    const nav = TreeViewNavigation.create({ treeview$ });
    expect(nav.tree.root.id.endsWith(':root')).to.eql(true);
  });

  it('query', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2' }],
    };
    const nav = create(root);
    expect(nav.query.findById('child-2')?.id).to.match(/child-2$/);
    expect(nav.query.findById('404')).to.eql(undefined);
  });

  it('change: current/selection', () => {
    const nav = create();
    expect(nav.current).to.eql(nav.root.id);
    expect(nav.selected).to.eql(undefined);

    const changed: t.ITreeViewNavigationChanged[] = [];
    nav.changed$.subscribe((e) => changed.push(e));

    nav.current = 'foo';
    expect(changed.length).to.eql(1);

    nav.selected = 'bar';
    expect(changed.length).to.eql(2);

    expect(changed[0].to.nav.current).to.eql('foo');
    expect(changed[1].to.nav.selected).to.eql('bar');

    expect(nav.current).to.eql('foo');
    expect(nav.selected).to.eql('bar');
  });

  describe('node', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
    };

    it('node: not found', () => {
      const nav = create(root);
      expect(nav.node()).to.eql(undefined);
      expect(nav.node('404')).to.eql(undefined);
    });

    it('node: found', () => {
      const nav = create(root);
      const node = nav.node('child-2');
      expect(node?.id).to.match(/child-2$/);
    });

    it('node: change', () => {
      const nav = create(root);
      expect(nav.query.findById('child-2')?.props).to.eql(undefined);

      const res = nav.node('child-2', (node) => {
        TreeViewNavigation.props(node, (props) => (props.icon = 'face'));
      });

      expect(res?.id).to.match(/child-2$/);
      expect(res?.props).to.eql({ treeview: { icon: 'face' } });
      expect(nav.query.findById('child-2')?.props).to.eql({ treeview: { icon: 'face' } });
    });
  });
});
