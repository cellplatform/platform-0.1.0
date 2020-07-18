import { TreeState } from '.';
import { expect, t, TreeUtil } from '../test';

type N = t.ITreeNode;

describe('TreeState', () => {
  describe('create', () => {
    it('without parent', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      expect(state.root).to.not.equal(root);
      expect(state.id).to.eql(state.root.id);
      expect(state.parent).to.eql(undefined);
      expect(state.children).to.eql([]);
      expect(state.namespace.length).to.greaterThan(10); // NB: This is a CUID.
    });

    it('with parent', () => {
      const root: N = { id: 'myLeaf' };
      const state = TreeState.create({ root, parent: 'myParent' });
      expect(state.parent).to.eql('myParent');
    });

    it('dispose', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });

      let count = 0;
      state.dispose$.subscribe((e) => count++);

      expect(state.isDisposed).to.eql(false);
      state.dispose();
      state.dispose();
      expect(state.isDisposed).to.eql(true);
    });
  });

  describe('rewrite IDs with namespace prefix', () => {
    it('simple', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      const start = `ns-${state.namespace}:`;
      expect(state.id.startsWith(start)).to.eql(true);
      expect(state.root.id.startsWith(start)).to.eql(true);
    });

    it('deep', () => {
      const root: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
      };
      const state = TreeState.create({ root });
      const ids: string[] = [];
      const start = `ns-${state.namespace}:`;
      TreeUtil.walkDown(state.root, (e) => ids.push(e.node.id));
      expect(ids.length).to.eql(4);
      expect(ids.every((id) => id.startsWith(start))).to.eql(true);
    });
  });

  describe('add', () => {
    it('add to "root"', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      expect(state.children).to.eql([]);

      const child = state.add({ parent: 'root', root: { id: 'foo' } });

      expect(state.children.length).to.eql(1);
      expect(state.children[0]).to.equal(child);
      expect(child.parent).to.eql(`ns-${state.namespace}:root`);
    });

    it('add: root id as string (not object)', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      const child = state.add({ parent: 'root', root: 'foo' });

      expect(state.children.length).to.eql(1);
      expect(child.id).to.eql(`ns-${child.namespace}:foo`);
    });

    it('add: no parent id (root id assumed)', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      const child = state.add({ root: 'foo' });

      expect(state.children.length).to.eql(1);
      expect(child.id).to.eql(`ns-${child.namespace}:foo`);
    });

    it('adds multiple children with same id (geneated namespaces differs)', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: { id: 'foo' } });

      expect(child1.id).to.not.eql(child2.id);
    });

    it('inserts node into parent state-tree', () => {
      const root: N = { id: 'root', children: [{ id: 'mary' }] };
      const state = TreeState.create({ root });

      expect((state.root.children || []).length).to.eql(1);

      const fired: t.ITreeStateChanged[] = [];
      state.payload<t.ITreeStateChangedEvent>('TreeState/changed').subscribe((e) => fired.push(e));

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });

      const children = state.root.children || [];
      expect(children.length).to.eql(2);
      expect(children[0].id).to.match(/\:mary$/);
      expect(children[1].id).to.eql(child1.id);

      expect(fired.length).to.eql(1);
      expect((fired[0].from.children || []).length).to.eql(1);
      expect((fired[0].to.children || []).length).to.eql(2);
    });

    it.skip('child added to more than one parent state-tree (at the same time)', () => {});

    it('event: added', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });

      const fired: t.ITreeStateChildAdded[] = [];
      state
        .payload<t.ITreeStateChildAddedEvent>('TreeState/child/added')
        .subscribe((e) => fired.push(e));

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: { id: 'foo' } });

      expect(fired.length).to.eql(2);
      expect(fired[0].child).to.equal(child1);
      expect(fired[1].child).to.equal(child2);

      expect(fired[0].parent).to.equal(state);
      expect(fired[1].parent).to.equal(state);
    });

    it('throw: "parent" does not exist', () => {
      const state = TreeState.create({ root: { id: 'root' } });
      const fn = () => state.add({ parent: '404', root: { id: 'foo' } });
      expect(fn).to.throw(/parent node '404' does not exist/);
    });
  });

  describe('remove', () => {
    it('removes (but does not dispose)', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });

      const fired: t.ITreeStateChildRemoved[] = [];
      state
        .payload<t.ITreeStateChildRemovedEvent>('TreeState/child/removed')
        .subscribe((e) => fired.push(e));

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: { id: 'foo' } });

      expect(state.children.length).to.eql(2);

      state.remove(child1);
      expect(state.children.length).to.eql(1);

      state.remove(child2);
      expect(state.children.length).to.eql(0);

      expect(child1.isDisposed).to.eql(false);
      expect(child2.isDisposed).to.eql(false);

      expect(fired.length).to.eql(2);
      expect(fired[0].child).to.eql(child1);
      expect(fired[1].child).to.eql(child2);
    });

    it('removes on [child.dispose()]', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });

      const fired: t.ITreeStateChildRemoved[] = [];
      state
        .payload<t.ITreeStateChildRemovedEvent>('TreeState/child/removed')
        .subscribe((e) => fired.push(e));

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: 'foo' });

      expect(state.children.length).to.eql(2);
      child1.dispose();
      expect(state.children.length).to.eql(1);
      child2.dispose();
      expect(state.children.length).to.eql(0);

      expect(fired.length).to.eql(2);
      expect(fired[0].child).to.eql(child1);
      expect(fired[1].child).to.eql(child2);
    });

    it('removes node from parent state-tree', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      const child1 = state.add({ parent: 'root', root: 'foo' });
      const child2 = state.add({ parent: 'root', root: 'foo' });

      const children = () => state.root.children || [];
      const count = () => children().length;
      const includes = (id: string) => (state.root.children || []).some((c) => c.id === id);

      expect(count()).to.eql(2);
      expect(includes(child1.id)).to.eql(true);
      expect(includes(child2.id)).to.eql(true);

      child1.dispose();
      expect(count()).to.eql(1);
      expect(includes(child1.id)).to.eql(false);
      expect(includes(child2.id)).to.eql(true);

      state.remove(child2);
      expect(count()).to.eql(0);
      expect(includes(child1.id)).to.eql(false);
      expect(includes(child2.id)).to.eql(false);
    });

    it('throw: remove child that does not exist', () => {
      const root: N = { id: 'root' };
      const state = TreeState.create({ root });
      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: { id: 'foo' } });

      const test = (child: string | t.ITreeState) => {
        const state = TreeState.create({ root });
        const fn = () => state.remove(child);
        expect(fn).to.throw(/Cannot remove child-state as it does not exist in the parent/);
      };

      test(child1.root.id);
      test(child1.id);
      test(child2);
    });
  });

  describe('change', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
    };

    it('simple', () => {
      const state = TreeState.create({ root });
      state.change((root, ctx) => {
        // NB: Convenience method.
        //     Ensures the props object and is assigned exists in a single line call.
        ctx.props(root, (p) => {
          p.label = 'Hello!';
          p.icon = 'face';
        });
      });
      expect(state.root.props?.label).to.eql('Hello!');
      expect(state.root.props?.icon).to.eql('face');
    });

    it('updates parent state-tree with child change', () => {
      const state = TreeState.create({ root });
      const child1 = state.add({ root: 'foo' });
      const child2 = state.add({ root: 'bar' });

      expect((state.root.children || []).length).to.eql(4);
      expect((state.root.children || [])[2].props).to.eql(undefined);

      // Make a change to child-1.
      child1.change((root, ctx) => ctx.props(root, (p) => (p.label = 'foo')));
      expect((state.root.children || [])[2].props).to.eql({ label: 'foo' });

      // Remove child-1, then update again (should not effect parent).
      child1.dispose();
      child1.change((root, ctx) => ctx.props(root, (p) => (p.label = 'bar')));
      expect((state.root.children || []).length).to.eql(3);

      // Make a change to child-2.
      child2.change((root, ctx) => ctx.props(root, (p) => (p.label = 'hello')));
      expect((state.root.children || [])[2].props).to.eql({ label: 'hello' });
    });

    it('event: changed', () => {
      const state = TreeState.create({ root });
      const fired: t.ITreeStateChanged[] = [];
      state.payload<t.ITreeStateChangedEvent>('TreeState/changed').subscribe((e) => fired.push(e));

      state.change((root, ctx) => {
        ctx.props(root, (p) => (p.label = 'foo'));
      });

      expect(fired.length).to.eql(1);
      expect(fired[0].from.props?.label).to.eql(undefined);
      expect(fired[0].to.props?.label).to.eql('foo');
    });

    it('event: changed (silent, not fired)', () => {
      const state = TreeState.create({ root });
      const fired: t.ITreeStateChanged[] = [];
      state.payload<t.ITreeStateChangedEvent>('TreeState/changed').subscribe((e) => fired.push(e));

      state.change(
        (root, ctx) => {
          ctx.props(root, (p) => (p.label = 'foo'));
        },
        { silent: true },
      );

      expect(fired.length).to.eql(0);
    });
  });

  describe('traverse', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
    };

    it('walkDown', () => {
      const state = TreeState.create({ root });

      const walked: t.ITreeStateVisit<N>[] = [];
      state.walkDown((e) => {
        expect(e.namespace).to.eql(state.namespace);
        expect(e.node.id.endsWith(`:${e.id}`)).to.eql(true);
        walked.push(e);
      });

      expect(walked.length).to.eql(4);
      expect(walked[0].id).to.eql('root');
      expect(walked[3].id).to.eql('child-2.1');
    });

    it('walkDown (skip children)', () => {
      const state = TreeState.create({ root });

      const walked: t.ITreeStateVisit<N>[] = [];
      state.walkDown((e) => {
        walked.push(e);
        if (e.id === 'child-2') {
          e.skip();
        }
      });

      expect(walked.length).to.eql(3);
      expect(walked[0].id).to.eql('root');
      expect(walked[1].id).to.eql('child-1');
      expect(walked[2].id).to.eql('child-2');
    });

    it('find', () => {
      const state = TreeState.create({ root });

      const walked: t.ITreeStateVisit<N>[] = [];
      state.walkDown((e) => walked.push(e));

      const res1 = state.find((e) => e.id === '404');
      const res2 = state.find((e) => e.id === 'root');
      const res3 = state.find((e) => e.id === 'child-2.1');

      expect(res1).to.eql(undefined);
      expect(res2).to.eql(walked[0].node);
      expect(res3).to.eql(walked[3].node);
    });

    it.skip('find: does not walk down into child-state nodes', () => {
      const state = TreeState.create({ root });

      // state.re

      const child = state.add({ parent: 'child-2.1', root: { id: 'foo' } });

      console.log('child.id', child.id);

      const f = TreeUtil.findById(state.root, child.id);
      console.log('f', f);

      console.log('state.root', state.root);
    });
  });
});
