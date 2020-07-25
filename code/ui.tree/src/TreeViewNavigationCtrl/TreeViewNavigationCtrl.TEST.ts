import { Subject } from 'rxjs';

import { TreeViewNavigationCtrl } from '.';
import { TreeState } from '../state';
import { expect, t } from '../test';

const create = () => {
  const treeview$ = new Subject<t.TreeViewEvent>();
  const tree = TreeState.create();
  return TreeViewNavigationCtrl.create({ treeview$, tree });
};

describe('TreeNavController', () => {
  it('create (current as root node)', () => {
    const ctrl = create();
    expect(ctrl.isDisposed).to.eql(false);
    expect(ctrl.current).to.eql(ctrl.root.id);
    expect(ctrl.selected).to.eql(undefined);
  });

  describe('mutate', () => {
    it('change', () => {
      const ctrl = create();
      expect(ctrl.current).to.eql(ctrl.root.id);
      expect(ctrl.selected).to.eql(undefined);

      const changed: t.ITreeViewNavigationChanged[] = [];
      ctrl.changed$.subscribe((e) => changed.push(e));

      ctrl.change({ current: 'foo' }).change({ selected: 'bar' });

      expect(changed.length).to.eql(2);

      expect(changed[0].to.nav.current).to.eql('foo');
      expect(changed[1].to.nav.selected).to.eql('bar');

      expect(ctrl.current).to.eql(undefined); // NB: Overwritten by second change (force).
      expect(ctrl.selected).to.eql('bar');
    });

    it('patch', () => {
      const ctrl = create();
      expect(ctrl.current).to.eql(ctrl.root.id);
      expect(ctrl.selected).to.eql(undefined);

      ctrl.patch({ current: 'foo' }).patch({ selected: 'bar' });

      // NB: Both values patched into existence.
      expect(ctrl.current).to.eql('foo');
      expect(ctrl.selected).to.eql('bar');
    });
  });
});
