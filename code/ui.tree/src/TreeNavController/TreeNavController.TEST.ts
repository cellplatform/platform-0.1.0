import { Subject } from 'rxjs';

import { TreeNavController } from '.';
import { TreeState } from '../state';
import { expect, t, time } from '../test';

const create = () => {
  const treeview$ = new Subject<t.TreeViewEvent>();
  const state = TreeState.create();
  return TreeNavController.create({ treeview$, state });
};

describe('TreeNavController', () => {
  it('create', () => {
    const ctrl = create();
    expect(ctrl.isDisposed).to.eql(false);
    expect(ctrl.current).to.eql(undefined);
  });

  describe('mutate', () => {
    it('change', () => {
      const ctrl = create();
      expect(ctrl.current).to.eql(undefined);
      expect(ctrl.selected).to.eql(undefined);

      const change: t.ITreeNavControllerChange[] = [];
      const changed: t.ITreeNavControllerChanged[] = [];
      ctrl.event.change$.subscribe((e) => change.push(e));
      ctrl.event.changed$.subscribe((e) => changed.push(e));

      ctrl.change({ current: 'foo' }).change({ selected: 'bar' });

      expect(change.length).to.eql(2);
      expect(changed.length).to.eql(2);

      expect(change[0].current).to.eql('foo');
      expect(change[1].selected).to.eql('bar');

      expect(ctrl.current).to.eql(undefined); // NB: Overwritten by second change (force).
      expect(ctrl.selected).to.eql('bar');
    });

    it('changed: not fired when no change', () => {
      const ctrl = create();

      ctrl.change({ current: 'foo' });
      expect(ctrl.current).to.eql('foo');

      const changed: t.ITreeNavControllerChanged[] = [];
      ctrl.event.changed$.subscribe((e) => changed.push(e));

      ctrl.change({ current: 'foo' });
      expect(changed.length).to.eql(0);
    });

    it('patch', () => {
      const ctrl = create();
      expect(ctrl.current).to.eql(undefined);
      expect(ctrl.selected).to.eql(undefined);

      ctrl.patch({ current: 'foo' }).patch({ selected: 'bar' });

      // NB: Both values patched into existence.
      expect(ctrl.current).to.eql('foo');
      expect(ctrl.selected).to.eql('bar');
    });
  });
});
