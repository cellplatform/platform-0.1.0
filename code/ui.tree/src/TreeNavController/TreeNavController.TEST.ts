import { Subject } from 'rxjs';

import { TreeNavController } from '.';
import { TreeState } from '../state';
import { expect, t } from '../test';
import { TreeNavControllerEvents } from './TreeNavControllerEvents';

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

  describe('events', () => {
    it('events [object]', () => {
      const ctrl = create();
      expect(ctrl.events).to.be.an.instanceof(TreeNavControllerEvents);
    });

    it('fire: changed', () => {
      const ctrl = create();
      expect(ctrl.current).to.eql(undefined);

      const fired: t.ITreeNavControllerChanged[] = [];
      ctrl.events.changed$.subscribe((e) => fired.push(e));

      ctrl.events.fire({ type: 'TreeNav/changed', payload: { currrent: 'foo' } });

      expect(ctrl.current).to.eql('foo');

      expect(fired.length).to.eql(1);
      expect(fired[0].currrent).to.eql('foo');
    });
  });
});
