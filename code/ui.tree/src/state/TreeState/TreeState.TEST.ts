import { TreeState } from '.';
import { expect, t } from '../../test';
import { helpers } from './helpers';
import { Subject } from '../../common/types';
import { TreeNodeIdentity } from '../../TreeNodeIdentity';
import { TreeQuery } from '../../TreeQuery';

type N = t.ITreeNode;
type P = { label?: string; icon?: string };

const query = TreeQuery.create;
const create = (args?: t.ITreeStateArgs) => TreeState.create<N>(args);

describe.only('TreeState', () => {
  describe('create', () => {
    it('without parent', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      expect(state.root).to.not.equal(root);
      expect(state.id).to.eql(state.root.id);
      expect(state.parent).to.eql(undefined);
      expect(state.children).to.eql([]);
      expect(state.namespace.length).to.greaterThan(10); // NB: This is a CUID.
    });

    it('with parent', () => {
      const root: N = { id: 'myLeaf' };
      const state = create({ root, parent: 'myParent' });
      expect(state.parent).to.eql('myParent');
    });

    it('create with no id (defaults to "node")', () => {
      const state = create();
      expect(helpers.id.stripNamespace(state.id)).to.eql('node');
      expect(helpers.id.namespace(state.id)).to.eql(state.namespace);
    });

    it('from root id (string)', () => {
      const state = create({ root: 'foo' });
      const id = `${state.namespace}:foo`;
      expect(state.id).to.eql(id);
      expect(state.root.id).to.eql(id);
    });
  });

  describe('dispose', () => {
    it('dispose', () => {
      const state = create();
      expect(state.isDisposed).to.eql(false);

      let count = 0;
      state.dispose$.subscribe((e) => count++);

      expect(state.isDisposed).to.eql(false);
      state.dispose();
      state.dispose();
      expect(state.isDisposed).to.eql(true);
    });

    it('dispose: event', () => {
      const state = create();
      state.change((root, ctx) => helpers.props<P>(root, (p) => (p.label = 'foo')));

      const fired: t.TreeStateEvent[] = [];
      state.event.$.subscribe((e) => fired.push(e));

      state.dispose();
      state.dispose();
      expect(fired.length).to.eql(1);

      const event = fired[0] as t.ITreeStateDisposedEvent;
      expect(event.type).to.eql('TreeState/disposed');
      expect(event.payload.final).to.eql(state.root);
    });

    it('disposes of all children', () => {
      const state = create();
      expect(state.isDisposed).to.eql(false);

      const child1 = state.add({ root: 'foo' });
      const child2 = child1.add({ root: 'bar' });
      const child3 = child2.add({ root: 'zoo' });

      child2.dispose();
      expect(child3.isDisposed).to.eql(true);

      state.dispose();
      expect(state.isDisposed).to.eql(true);
      expect(child1.isDisposed).to.eql(true);
      expect(child2.isDisposed).to.eql(true);
      expect(child3.isDisposed).to.eql(true);
    });

    it('takes a [dispose$] within constructor', () => {
      const dispose$ = new Subject();
      const state = create({ dispose$ });
      expect(state.isDisposed).to.eql(false);

      let count = 0;
      state.dispose$.subscribe(() => count++);

      dispose$.next();
      dispose$.next();
      dispose$.next();
      expect(state.isDisposed).to.eql(true);
      expect(count).to.eql(1);
    });
  });

  describe('static', () => {
    it('isInstance', () => {
      const test = (input: any, expected: boolean) => {
        expect(TreeState.isInstance(input)).to.eql(expected);
      };

      const instance = create({ root: 'foo' });
      test(instance, true);

      test(undefined, false);
      test(null, false);
      test('', false);
      test({ id: 'foo' }, false);
    });

    it('identity', () => {
      expect(TreeState.identity).to.equal(TreeNodeIdentity);
    });
  });

  describe('rewrite IDs with namespace prefix', () => {
    it('simple', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      const start = `${state.namespace}:`;
      expect(state.id.startsWith(start)).to.eql(true);
      expect(state.root.id.startsWith(start)).to.eql(true);
    });

    it('deep', () => {
      const root: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
      };
      const state = create({ root });
      const ids: string[] = [];
      const start = `${state.namespace}:`;
      query(state.root).walkDown((e) => ids.push(e.node.id));
      expect(ids.length).to.eql(4);
      expect(ids.every((id) => id.startsWith(start))).to.eql(true);
    });
  });

  describe('add', () => {
    it('add: root as {object} (TreeNode)', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      expect(state.children).to.eql([]);

      const child = state.add({ parent: 'root', root: { id: 'foo' } });

      expect(state.children.length).to.eql(1);
      expect(state.children[0]).to.equal(child);
      expect(child.parent).to.eql(`${state.namespace}:root`);
    });

    it('add: root as string ("id")', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      const child = state.add({ parent: 'root', root: 'foo' });

      expect(state.children.length).to.eql(1);
      expect(child.id).to.eql(`${child.namespace}:foo`);
    });

    it('add: { root: [TreeState] } - pre-existing', () => {
      const state = create({ root: 'root' });
      expect(state.root.children).to.eql(undefined);

      const child = create({ root: 'foo' });
      expect(state.namespace).to.not.eql(child.namespace);

      state.add({ root: child });

      expect(helpers.children(state.root)[0].id).to.eql(child.id);
      expect(state.children.includes(child)).to.eql(true);
    });

    it('add: [TreeState] - pre-existing, as base argument', () => {
      const state = create({ root: 'root' });
      expect(state.root.children).to.eql(undefined);

      const child = create({ root: 'foo' });
      expect(state.namespace).to.not.eql(child.namespace);

      state.add(child);

      expect(helpers.children(state.root)[0].id).to.eql(child.id);
      expect(state.children.includes(child)).to.eql(true);
    });

    it('add: no parent id (root id assumed)', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      const child = state.add({ root: 'foo' });

      expect(state.children.length).to.eql(1);
      expect(child.id).to.eql(`${child.namespace}:foo`);
    });

    it('adds multiple children with same id (geneated namespaces differs)', () => {
      const root: N = { id: 'root' };
      const state = create({ root });

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: { id: 'foo' } });

      expect(child1.id).to.not.eql(child2.id);
    });

    it('inserts node into parent state-tree data', () => {
      const root: N = { id: 'root', children: [{ id: 'mary' }] };
      const state = create({ root });

      expect((state.root.children || []).length).to.eql(1);

      const fired: t.ITreeStateChanged<N>[] = [];
      state.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => fired.push(e));

      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });

      const children = state.root.children || [];
      expect(children.length).to.eql(2);
      expect(children[0].id).to.match(/\:mary$/);
      expect(children[1].id).to.eql(child1.id);

      expect(fired.length).to.eql(1);
      expect((fired[0].from.children || []).length).to.eql(1);
      expect((fired[0].to.children || []).length).to.eql(2);
    });

    it('child added to more than one parent [StateTree] (at the same time)', () => {
      const state1 = create({ root: 'root-1' });
      const state2 = create({ root: 'root-2' });
      const child = create({ root: 'child' });

      expect(state1.namespace).to.not.eql(state2.namespace);

      state1.add(child);
      state2.add(child);

      const childAt = (state: t.ITreeState<N>, i: number) => helpers.children(state.root)[i];
      const firstChild = (state: t.ITreeState<N>) => childAt(state, 0);

      expect(firstChild(state1).id).to.eql(child.id);
      expect(firstChild(state2).id).to.eql(child.id);

      child.change((draft, ctx) => {
        helpers.props<P>(draft).label = 'hello';
      });
      expect(firstChild(state1).props).to.eql({ label: 'hello' });
      expect(firstChild(state2).props).to.eql({ label: 'hello' });

      state1.remove(child);
      expect(firstChild(state1)).to.eql(undefined);
      expect(firstChild(state2).id).to.eql(child.id);

      child.dispose();
      expect(firstChild(state1)).to.eql(undefined);
      expect(firstChild(state2)).to.eql(undefined);
    });

    it('event: added', () => {
      const root: N = { id: 'root' };
      const state = create({ root });

      const fired: t.ITreeStateChildAdded[] = [];
      state.event
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
      const state = create({ root: { id: 'root' } });
      const fn = () => state.add({ parent: '404', root: { id: 'foo' } });
      expect(fn).to.throw(/parent node '404' does not exist/);
    });

    it('throw: child already added', () => {
      const state = create({ root: 'root' });
      const child = state.add({ root: 'child' });

      expect(state.children.length).to.eql(1);
      expect(state.namespace).to.not.eql(child.namespace);

      const fn = () => state.add({ root: child });
      expect(fn).to.throw(/already exists/);
    });
  });

  describe('remove', () => {
    it('removes (but does not dispose)', () => {
      const root: N = { id: 'root' };
      const state = create({ root });

      const fired: t.ITreeStateChildRemoved[] = [];
      state.event
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
      const state = create({ root });

      const fired: t.ITreeStateChildRemoved[] = [];
      state.event
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

    it('removes node from parent state-tree data', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
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
      const state = create({ root });
      const child1 = state.add({ parent: 'root', root: { id: 'foo' } });
      const child2 = state.add({ parent: 'root', root: { id: 'foo' } });

      const test = (child: string | t.ITreeState) => {
        const state = create({ root });
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
      const state = create({ root });
      const res = state.change((root, ctx) => {
        // NB: Convenience method.
        //     Ensures the props object and is assigned exists in a single line call.
        helpers.props<P>(root, (p) => {
          p.label = 'Hello!';
          p.icon = 'face';
        });
      });
      expect(state.root.props?.label).to.eql('Hello!');
      expect(state.root.props?.icon).to.eql('face');

      expect(res.op).to.eql('update');
      expect(res.cid.length).to.greaterThan(10);
      expect(res.changed?.from.props).to.eql(undefined);
      expect(res.changed?.to.props?.label).to.eql('Hello!');

      const { prev, next } = res.patches;
      expect(prev.length).to.eql(1);
      expect(next.length).to.eql(1);
      expect(prev[0]).to.eql({ op: 'remove', path: 'props' });
      expect(next[0]).to.eql({
        op: 'add',
        path: 'props',
        value: { label: 'Hello!', icon: 'face' },
      });
    });

    it('child array: insert (updates id namespaces)', () => {
      const state = create({ root: 'root' });

      state.change((root, ctx) => {
        const children = TreeState.children(root);
        children.push(...[{ id: 'foo', children: [{ id: 'foo.1' }] }, { id: 'bar' }]);
      });

      const ns = TreeState.identity.hasNamespace;

      const children = state.root.children || [];
      expect(children.length).to.eql(2);

      expect(ns(children[0].id)).to.eql(true);
      expect(ns(children[1].id)).to.eql(true);
      expect(ns((children[0].children || [])[0].id)).to.eql(true); // Deep.
    });

    it('updates parent state-tree when child changes', () => {
      const state = create({ root });
      const child1 = state.add({ root: 'foo' });
      const child2 = state.add({ root: 'bar' });

      const children = () => state.root.children || [];
      const count = () => children().length;

      expect(count()).to.eql(4);
      expect(children()[2].props).to.eql(undefined);

      // Make a change to child-1.
      child1.change((root, ctx) => helpers.props<P>(root, (p) => (p.label = 'foo')));
      expect(children()[2].props).to.eql({ label: 'foo' });

      // Remove child-1, then update again (should not effect parent).
      child1.dispose();
      child1.change((root, ctx) => helpers.props<P>(root, (p) => (p.label = 'bar')));
      expect(count()).to.eql(3);

      // Make a change to child-2.
      child2.change((root, ctx) => helpers.props<P>(root, (p) => (p.label = 'hello')));
      expect(children()[2].props).to.eql({ label: 'hello' });
    });

    it('updates parent state-tree when child changes (deep)', () => {
      const state = create({ root: { id: 'root' } });
      const child1 = state.add({ root: 'foo' });
      const child2 = child1.add({ root: 'bar' });

      const children = (node: N) => node.children || [];
      const grandchild = () => children(children(state.root)[0])[0];

      expect(grandchild().props).to.eql(undefined);

      child2.change((draft, ctx) => (helpers.props<P>(draft).label = 'hello'));

      expect(grandchild().props).to.eql({ label: 'hello' });
    });

    it('event: changed', () => {
      const state = create({ root });
      const fired: t.ITreeStateChanged<N>[] = [];
      state.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => fired.push(e));

      const res = state.change((root, ctx) => {
        helpers.props<P>(root, (p) => (p.label = 'foo'));
      });

      expect(fired.length).to.eql(1);

      const event = fired[0];
      expect(event.from.props?.label).to.eql(undefined);
      expect(event.to.props?.label).to.eql('foo');
      expect(event.patches).to.eql(res.patches);
    });

    it('event: changed (silent, not fired)', () => {
      const state = create({ root });
      const fired: t.ITreeStateChanged[] = [];
      state.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => fired.push(e));

      state.change(
        (root) => {
          helpers.props<P>(root, (p) => (p.label = 'foo'));
        },
        { silent: true },
      );

      expect(fired.length).to.eql(0);
    });
  });

  describe('query', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
    };

    it('has query', () => {
      const state = create({ root });
      const query = state.query;
      expect(query.root).to.eql(state.root);
      expect(query.namespace).to.eql(state.namespace);
    });

    describe('walkDown', () => {
      it('walkDown', () => {
        const state = create({ root });

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => {
          expect(e.namespace).to.eql(state.namespace);
          expect(e.node.id.endsWith(`:${e.id}`)).to.eql(true);
          walked.push(e);
        });

        expect(walked.length).to.eql(4);
        expect(walked[0].id).to.eql('root');
        expect(walked[3].id).to.eql('child-2.1');
      });

      it('walkDown: stop', () => {
        const state = create({ root });

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => {
          walked.push(e);
          if (e.id === 'child-1') {
            e.stop();
          }
        });

        expect(walked.length).to.eql(2);
        expect(walked[0].id).to.eql('root');
        expect(walked[1].id).to.eql('child-1');
      });

      it('walkDown: skip (children)', () => {
        const state = create({ root });

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => {
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

      it('walkDown: does not walk down into child namespace', () => {
        const state = create({ root });
        const child = state.add({ parent: 'child-2.1', root: { id: 'foo' } });
        expect(child.namespace).to.not.eql(state.namespace);

        // Verify: Can be round within the root data-structure using a raw search algorithm.
        expect(query(state.root).findById(child.id)?.id).to.eql(child.id);

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => walked.push(e));

        const ids = walked.map((e) => e.id);
        expect(ids.length).to.greaterThan(0);
        expect(ids.includes('foo')).to.eql(false);
      });
    });

    describe('walkUp', () => {
      it('walkUp', () => {
        const state = create({ root });

        const test = (startAt?: string | N) => {
          const walked: t.ITreeAscend<N>[] = [];
          state.query.walkUp(startAt, (e) => walked.push(e));
          expect(walked.map((e) => e.id)).to.eql(['child-2.1', 'child-2', 'root']);
        };

        test('child-2.1');
        test(state.query.findById('child-2.1'));
      });

      it('walkUp: startAt not found', () => {
        const state = create({ root });

        const test = (startAt?: N | string) => {
          const walked: t.ITreeAscend<N>[] = [];
          state.query.walkUp(startAt, (e) => walked.push(e));
          expect(walked).to.eql([]);
        };

        test();
        test('404');
        test({ id: '404' });
      });

      it('walkUp: does not walk up into parent namespace', () => {
        const state = create({ root });
        const child = state.add<N>({
          parent: 'child-2.1',
          root: { id: 'foo', children: [{ id: 'foo.child' }] },
        });

        const fooChild = child.query.findById('foo.child');
        expect(fooChild).to.exist;

        const test = (startAt?: string | N) => {
          const walked: t.ITreeAscend<N>[] = [];
          child.query.walkUp(startAt, (e) => walked.push(e));
          expect(walked.map((e) => e.id)).to.eql(['foo.child', 'foo']);
        };

        test(fooChild);
        test(fooChild?.id);
        test('foo.child');
      });

      it('walkUp: not within namespace', () => {
        const state = create({ root });
        const child = state.add({
          parent: 'child-2.1',
          root: { id: 'foo', children: [{ id: 'foo.child' }] },
        });

        const fooChild = child.query.findById('foo.child');
        expect(fooChild).to.exist;

        const walked: t.ITreeAscend<N>[] = [];
        state.query.walkUp(fooChild, (e) => walked.push(e));

        expect(walked.map((e) => e.id)).to.eql([]);
      });
    });

    describe('find', () => {
      it('find', () => {
        const state = create({ root });

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => walked.push(e));

        const res1 = state.query.findById('404');
        const res2 = state.query.findById('root');
        const res3 = state.query.findById('child-2.1');

        expect(res1).to.eql(undefined);
        expect(res2).to.eql(walked[0].node);
        expect(res3).to.eql(walked[3].node);
      });

      it('find: root (immediate)', () => {
        const state = create({ root: 'root' });
        const res = state.query.findById('root');
        expect(res?.id).to.eql(state.id);
      });

      it('find: does not walk down into child namespace', () => {
        const state = create({ root });
        const child = state.add({ parent: 'child-2.1', root: { id: 'foo' } });
        expect(child.namespace).to.not.eql(state.namespace);

        // Verify: Can be round within the root data-structure using a raw search algorithm.
        expect(query(state.root).findById(child.id)?.id).to.eql(child.id);

        // Lookup: root namespace.
        expect(state.query.findById('foo')).to.eql(undefined);
        expect(state.query.findById('child-2.1')?.id).to.eql(state.toId('child-2.1'));

        // Lookup: child namespace.
        expect(child.query.findById('foo')?.id).to.eql(child.id);
        expect(child.query.findById('child-2.1')?.id).to.eql(undefined);
      });
    });

    describe('exists', () => {
      it('does exist', () => {
        const state = create({ root });
        const res = state.query.findById('child-2.1');
        expect(TreeState.identity.parse(res?.id).id).to.eql('child-2.1');
      });

      it('does not exist', () => {
        const state = create({ root });
        const res = state.query.findById('404');
        expect(res).to.eql(undefined);
      });
    });
  });

  describe('child (find)', () => {
    it('empty', () => {
      const root: N = { id: 'root' };
      const state = create({ root });

      const list: t.TreeStateFindMatchArgs[] = [];
      const res = state.find((e) => {
        list.push(e);
        return false;
      });

      expect(res).to.eql(undefined);
      expect(list).to.eql([]);
    });

    it('deep', () => {
      const state = create();
      const child1 = state.add({ root: 'child-1' });
      const child2a = child1.add({ root: 'child-2a' });
      child1.add({ root: 'child-2a' }); // NB: Skipped because child-3 found first (child of "2a").
      const child3 = child2a.add({ root: 'child-3' });

      const list: t.TreeStateFindMatchArgs[] = [];
      const res = state.find((e) => {
        list.push(e);
        return e.id === 'child-3';
      });

      expect(list.length).to.eql(3);
      expect(res?.id).to.equal(child3.id);

      expect(list[0].tree.id).to.eql(child1.id);
      expect(list[1].tree.id).to.eql(child2a.id);
      expect(list[2].tree.id).to.eql(child3.id);
    });

    it('stop (walking)', () => {
      const state = create();
      const child1 = state.add({ root: 'child-1' });
      const child2a = child1.add({ root: 'child-2a' });
      child1.add({ root: 'child-2b' }); // NB: Skipped because child-3 found first (child of "2a").
      child2a.add({ root: 'child-3' });

      const list: t.TreeStateFindMatchArgs[] = [];
      const res = state.find((e) => {
        list.push(e);
        if (e.id === 'child-2a') {
          e.stop();
        }
        return e.id === 'child-3';
      });
      expect(list.map((e) => e.id)).to.eql(['child-1', 'child-2a']);
      expect(res).to.eql(undefined);
    });
  });
});
