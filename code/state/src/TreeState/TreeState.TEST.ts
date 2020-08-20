import { Subject } from 'rxjs';

import { TreeState } from '.';
import { expect, t } from '../test';
import { TreeIdentity } from '../TreeIdentity';
import { TreeQuery } from '../TreeQuery';
import { helpers } from './helpers';

import { isDraft } from 'immer';

type P = { label?: string; icon?: string };
type N = t.ITreeNode<P>;

const query = TreeQuery.create;
const create = TreeState.create;

describe('TreeState', () => {
  describe('create', () => {
    it('without parent', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      expect(state.root).to.not.equal(root);
      expect(state.parent).to.eql(undefined);
      expect(state.children).to.eql([]);
      expect(state.id).to.eql(state.root.id);
      expect(state.key).to.eql('root');
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

    it('from root id (parses <namespace>:<id>)', () => {
      const state = create({ root: 'ns:foo' });
      expect(state.namespace).to.eql('ns');
      expect(state.id).to.eql('ns:foo');
    });

    it('readonly', () => {
      const root: N = { id: 'root' };
      const state = create({ root });
      expect(state.readonly).to.equal(state);
    });

    it('throw: id contains "/" character', () => {
      const fn = () => create({ root: 'foo/bar' });
      expect(fn).to.throw(/Tree node IDs cannot contain the "\/" character/);
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
      state.change((root, ctx) => ctx.props(root, (p) => (p.label = 'foo')));

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
      expect(TreeState.identity).to.equal(TreeIdentity);
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
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2-1' }] }],
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
        ctx.props(draft).label = 'hello';
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

  describe('clear', () => {
    it('empty', () => {
      const root: N = { id: 'root' };
      const state = create({ root });

      expect(state.children.length).to.eql(0);
      state.clear();
      expect(state.children.length).to.eql(0);
    });

    it('removes all children', () => {
      const root: N = { id: 'root' };
      const state = create({ root });

      const fired: t.ITreeStateChildRemoved[] = [];
      state.event.childRemoved$.subscribe((e) => fired.push(e));

      const parent = 'root';
      state.add({ parent, root: 'foo' });
      state.add({ parent, root: 'bar' });

      expect(state.children.length).to.eql(2);
      state.clear();
      expect(state.children.length).to.eql(0);
      expect(fired.length).to.eql(2);
    });
  });

  describe('change', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2-1' }] }],
    };

    it('simple', () => {
      const state = create({ root });
      const res = state.change((draft, ctx) => {
        // NB: Convenience method.
        //     Ensures the props object is assigned and exists in a single-line-call.
        ctx.props(draft, (p) => {
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

      state.change((draft, ctx) => {
        const children = TreeState.children(draft);
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
      child1.change((draft, ctx) => ctx.props(draft, (p) => (p.label = 'foo')));
      expect(children()[2].props).to.eql({ label: 'foo' });

      // Remove child-1, then update again (should not effect parent).
      child1.dispose();
      child1.change((draft, ctx) => ctx.props(draft, (p) => (p.label = 'bar')));
      expect(count()).to.eql(3);

      // Make a change to child-2.
      child2.change((root, ctx) => ctx.props(root, (p) => (p.label = 'hello')));
      expect(children()[2].props).to.eql({ label: 'hello' });
    });

    it('updates parent state-tree when child changes (deep)', () => {
      const state = create({ root: { id: 'root' } });
      const child1 = state.add({ root: 'foo' });
      const child2 = child1.add({ root: 'bar' });

      const children = (node: N) => node.children || [];
      const grandchild = () => children(children(state.root)[0])[0];

      expect(grandchild().props).to.eql(undefined);
      child2.change((draft, ctx) => (ctx.props(draft).label = 'hello'));
      expect(grandchild().props).to.eql({ label: 'hello' });
    });

    it('updates from found/queried node', () => {
      const state = create({ root });
      expect(state.query.findById('child-1')?.props).to.eql(undefined);

      state.change((draft, ctx) => {
        const child = ctx.findById('child-1');
        if (child) {
          ctx.props(child, (p) => (p.label = 'hello'));
        }
      });

      expect(state.query.findById('child-1')?.props).to.eql({ label: 'hello' });
    });
  });

  describe('change (events)', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2-1' }] }],
    };

    it('event: changed', () => {
      const state = create({ root });
      const fired: t.ITreeStateChanged<N>[] = [];
      state.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => fired.push(e));

      const res = state.change((root, ctx) => {
        ctx.props(root, (p) => (p.label = 'foo'));
      });

      expect(fired.length).to.eql(1);

      const event = fired[0];
      expect(event.from.props?.label).to.eql(undefined);
      expect(event.to.props?.label).to.eql('foo');
      expect(event.patches).to.eql(res.patches);
    });

    it('event: changed (fires from root when child changes)', () => {
      const state = create({ root });
      const child = state.add({ root: 'foo' });

      const firedRoot: t.ITreeStateChanged<N>[] = [];
      state.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => firedRoot.push(e));

      const firedChild: t.ITreeStateChanged<N>[] = [];
      child.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => firedChild.push(e));

      // Make a change to child.
      child.change((draft, ctx) => ctx.props(draft, (p) => (p.label = 'foo')));

      expect(firedRoot.length).to.eql(1);
      expect(firedChild.length).to.eql(1);

      expect(firedRoot[0].patches.next[0].op).to.eql('replace');
      expect(firedChild[0].patches.next[0].op).to.eql('add');
    });

    it('event: patched', () => {
      const state = create({ root });
      const fired: t.ITreeStatePatched[] = [];
      state.event
        .payload<t.ITreeStatePatchedEvent>('TreeState/patched')
        .subscribe((e) => fired.push(e));

      const res = state.change((root, ctx) => {
        ctx.props(root, (p) => (p.label = 'foo'));
      });

      expect(fired.length).to.eql(1);

      const event = fired[0];
      expect(event.prev).to.eql(res.patches.prev);
      expect(event.next).to.eql(res.patches.next);
    });

    it('event: does not fire when nothing changes', () => {
      const state = create({ root });
      const fired: t.ITreeStateChanged[] = [];
      state.event
        .payload<t.ITreeStateChangedEvent>('TreeState/changed')
        .subscribe((e) => fired.push(e));

      const res = state.change((root) => {
        // NB: change nothing.
      });

      expect(fired.length).to.eql(0);
      expect(res.changed).to.eql(undefined);
    });
  });

  describe('change: ctx (context)', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2-1' }] }],
    };

    it('toObject', () => {
      const state = create({ root });
      state.change((draft, ctx) => {
        const child = ctx.findById('child-2-1');
        expect(child).to.exist;

        if (child) {
          expect(isDraft(draft)).to.eql(true);
          expect(isDraft(child)).to.eql(true);

          expect(isDraft(ctx.toObject(draft))).to.eql(false);
          expect(isDraft(ctx.toObject(child))).to.eql(false);
        }
      });
    });
  });

  describe('query', () => {
    const root: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2-1' }] }],
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
          expect(e.node.id.endsWith(`:${e.key}`)).to.eql(true);
          walked.push(e);
        });

        expect(walked.length).to.eql(4);
        expect(walked[0].key).to.eql('root');
        expect(walked[3].key).to.eql('child-2-1');
      });

      it('walkDown: stop', () => {
        const state = create({ root });

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => {
          walked.push(e);
          if (e.key === 'child-1') {
            e.stop();
          }
        });

        expect(walked.length).to.eql(2);
        expect(walked[0].key).to.eql('root');
        expect(walked[1].key).to.eql('child-1');
      });

      it('walkDown: skip (children)', () => {
        const state = create({ root });

        const walked: t.ITreeDescend<N>[] = [];
        state.query.walkDown((e) => {
          walked.push(e);
          if (e.key === 'child-2') {
            e.skip();
          }
        });

        expect(walked.length).to.eql(3);
        expect(walked[0].key).to.eql('root');
        expect(walked[1].key).to.eql('child-1');
        expect(walked[2].key).to.eql('child-2');
      });

      it('walkDown: does not walk down into child namespace', () => {
        const state = create({ root });
        const child = state.add({ parent: 'child-2-1', root: { id: 'foo' } });
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
          expect(walked.map((e) => e.key)).to.eql(['child-2-1', 'child-2', 'root']);
        };

        test('child-2-1');
        test(state.query.findById('child-2-1'));
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
          parent: 'child-2-1',
          root: { id: 'foo', children: [{ id: 'foo.child' }] },
        });

        const fooChild = child.query.findById('foo.child');
        expect(fooChild).to.exist;

        const test = (startAt?: string | N) => {
          const walked: t.ITreeAscend<N>[] = [];
          child.query.walkUp(startAt, (e) => walked.push(e));
          expect(walked.map((e) => e.key)).to.eql(['foo.child', 'foo']);
        };

        test(fooChild);
        test(fooChild?.id);
        test('foo.child');
      });

      it('walkUp: not within namespace', () => {
        const state = create({ root });
        const child = state.add({
          parent: 'child-2-1',
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
        const res3 = state.query.findById('child-2-1');

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
        const child = state.add({ parent: 'child-2-1', root: { id: 'foo' } });
        expect(child.namespace).to.not.eql(state.namespace);

        // Verify: Can be round within the root data-structure using a raw search algorithm.
        expect(query(state.root).findById(child.id)?.id).to.eql(child.id);

        // Lookup: root namespace.
        expect(state.query.findById('foo')).to.eql(undefined);
        expect(state.query.findById('child-2-1')?.id).to.eql(state.formatId('child-2-1'));

        // Lookup: child namespace.
        expect(child.query.findById('foo')?.id).to.eql(child.id);
        expect(child.query.findById('child-2-1')?.id).to.eql(undefined);
      });
    });

    describe('exists', () => {
      it('does exist', () => {
        const state = create({ root });
        const res = state.query.findById('child-2-1');
        expect(TreeState.identity.parse(res?.id).key).to.eql('child-2-1');
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
      const tree = create({ root });

      const list: t.ITreeStateDescend[] = [];
      const res = tree.find((e) => {
        list.push(e);
        return false;
      });

      expect(res).to.eql(undefined);
      expect(list).to.eql([]);
    });

    it('undefined/null', () => {
      const root: N = { id: 'root' };
      const tree = create({ root });

      expect(tree.find()).to.eql(undefined);
      expect(tree.find(null as any)).to.eql(undefined);
    });

    it('deep', () => {
      const tree = create();
      const child1 = tree.add({ root: 'child-1' });
      const child2a = child1.add({ root: 'child-2a' });
      child1.add({ root: 'child-2a' }); // NB: Skipped because child-3 found first (child of "2a").
      const child3 = child2a.add({ root: 'child-3' });

      const list: t.ITreeStateDescend[] = [];
      const res = tree.find((e) => {
        list.push(e);
        return e.key === 'child-3';
      });

      expect(list.length).to.eql(3);
      expect(res?.id).to.equal(child3.id);

      expect(list[0].tree.id).to.eql(child1.id);
      expect(list[1].tree.id).to.eql(child2a.id);
      expect(list[2].tree.id).to.eql(child3.id);
    });

    it('flat', () => {
      const root: N = { id: 'root' };
      const tree = create({ root });

      const child1 = tree.add({ root: 'child-1' });
      const child2 = tree.add({ root: 'child-2' });
      const child3 = tree.add({ root: 'child-3' });

      const list: t.ITreeStateDescend[] = [];
      const res = tree.find((e) => {
        list.push(e);
        return e.key === 'child-3';
      });

      expect(res?.id).to.equal(child3.id);

      expect(list.length).to.eql(3);
      expect(list[0].tree.id).to.eql(child1.id);
      expect(list[1].tree.id).to.eql(child2.id);
      expect(list[2].tree.id).to.eql(child3.id);
    });

    it('via node-identifier (param)', () => {
      const tree = create();
      const child1 = tree.add({ root: 'child-1' });
      const child2a = child1.add({ root: 'child-2a' });

      expect(tree.find(child2a.id)).to.equal(child2a);
      expect(tree.find(child2a)).to.equal(child2a);
      expect(tree.find('404')).to.equal(undefined);
    });

    it('node-identifer descendent of child module', () => {
      const tree = create();
      const child1 = tree.add({ root: 'child-1' });
      const child2a = child1.add({ root: { id: 'child-2a', children: [{ id: 'foo' }] } });

      const query = TreeQuery.create({ root: tree.root });
      const node = query.find((e) => e.key === 'foo');
      expect(node).to.exist;

      expect(tree.find(node)).to.equal(child2a);
      expect(tree.find(node?.id)).to.equal(child2a);
    });

    it('toString => fully qualified identifier (<namespace>:<id>)', () => {
      const tree = create();
      const child1 = tree.add({ root: 'child-1' });
      child1.add({ root: 'ns:child-2a' });

      const res1 = tree.find((e) => e.toString() === 'ns:child-2a');
      const res2 = tree.find((e) => e.id === 'ns:child-2a');

      expect(res1?.id).to.eql('ns:child-2a');
      expect(res2?.id).to.eql('ns:child-2a');
    });

    it('stop (walking)', () => {
      const tree = create();
      const child1 = tree.add({ root: 'child-1' });
      const child2a = child1.add({ root: 'child-2a' });
      child1.add({ root: 'child-2b' }); // NB: Skipped because child-3 found first (child of "2a").
      child2a.add({ root: 'child-3' });

      const list: t.ITreeStateDescend[] = [];
      const res = tree.find((e) => {
        list.push(e);
        if (e.key === 'child-2a') {
          e.stop();
        }
        return e.key === 'child-3';
      });
      expect(list.map((e) => e.key)).to.eql(['child-1', 'child-2a']);
      expect(res).to.eql(undefined);
    });
  });

  describe('contains', () => {
    const tree = create();
    const child1 = tree.add({ root: 'ns1:child-1' });
    const child2a = child1.add({
      root: { id: 'child-2a', children: [{ id: 'foo' }, { id: 'ns2:bar' }] },
    });
    const child3 = create({ root: 'child-3' });

    const query = TreeQuery.create({ root: tree.root });
    const foo = query.find((e) => e.key === 'foo');
    const bar = query.find((e) => e.key === 'bar');

    it('empty', () => {
      expect(tree.contains('')).to.eql(false);
      expect(tree.contains(' ')).to.eql(false);
      expect(tree.contains(undefined)).to.eql(false);
      expect(tree.contains(null as any)).to.eql(false);
    });

    it('does not contain', () => {
      expect(tree.contains('404')).to.eql(false);
      expect(tree.contains({ id: '404' })).to.eql(false);
      expect(tree.contains((e) => false)).to.eql(false);
      expect(tree.contains(child3)).to.eql(false); // NB: not added.
      expect(tree.contains(tree)).to.eql(false); // NB: does not contain itself.
    });

    it('does contain (via match function)', () => {
      const res = tree.contains((e) => e.id === child2a.id);
      expect(res).to.eql(true);
    });

    it('does contain (via node-identifier)', () => {
      expect(foo).to.exist;
      expect(bar).to.exist;

      expect(tree.contains(child2a.id)).to.eql(true);
      expect(tree.contains(child2a)).to.eql(true);

      expect(tree.contains(foo)).to.eql(true);
      expect(tree.contains(foo?.id)).to.eql(true);
    });

    it('does not contain child nodes within different descendent namespace', () => {
      expect(tree.contains(bar)).to.eql(false);
      expect(tree.contains(bar?.id)).to.eql(false);
    });
  });

  describe('walkDown', () => {
    const state = create({ root: 'root' });
    const child1 = state.add({ root: { id: 'child-1' } });
    const child2 = child1.add({ root: { id: 'child-2' } });
    const child3 = child1.add({ root: { id: 'child-3' } });
    const child4 = child3.add({ root: { id: 'child-4' } });

    it('walkDown: no children (visits root)', () => {
      const state = create({ root: 'root' });
      const items: t.ITreeStateDescend<N>[] = [];
      state.walkDown((e) => items.push(e));

      expect(items.length).to.eql(1);
      expect(items[0].id).to.eql(state.id);
      expect(items[0].key).to.eql(state.key);
      expect(items[0].namespace).to.eql(state.namespace);
      expect(items[0].level).to.eql(0);
      expect(items[0].index).to.eql(-1);
    });

    it('walkDown: deep', () => {
      const items: t.ITreeStateDescend<N>[] = [];
      state.walkDown((e) => items.push(e));

      expect(items.length).to.eql(5);

      expect(items[0].id).to.eql(state.id);
      expect(items[1].id).to.eql(child1.id);
      expect(items[2].id).to.eql(child2.id);
      expect(items[3].id).to.eql(child3.id);
      expect(items[4].id).to.eql(child4.id);

      expect(items[0].level).to.eql(0);
      expect(items[1].level).to.eql(1);
      expect(items[2].level).to.eql(2);
      expect(items[3].level).to.eql(2);
      expect(items[4].level).to.eql(3);

      expect(items[0].index).to.eql(-1);
      expect(items[1].index).to.eql(0);
      expect(items[2].index).to.eql(0);
      expect(items[3].index).to.eql(1);
      expect(items[4].index).to.eql(0);

      expect(items[0].parent).to.eql(undefined);
      expect(items[1].parent?.id).to.eql(state.id);
    });

    it('walkDown: stop', () => {
      const items: t.ITreeStateDescend<N>[] = [];
      state.walkDown((e) => {
        if (e.level > 0) {
          e.stop();
        }
        items.push(e);
      });

      expect(items.length).to.eql(2);
      expect(items[0].id).to.eql(state.id);
      expect(items[1].id).to.eql(child1.id);
    });

    it('walkDown: skip', () => {
      const items: t.ITreeStateDescend<N>[] = [];
      state.walkDown((e) => {
        if (e.key === 'child-3') {
          e.skip();
        }
        items.push(e);
      });

      expect(items.length).to.eql(4);
      expect(items.map((e) => e.key)).to.not.include('child-4');
    });
  });

  describe('syncFrom', () => {
    const tree1: N = {
      id: 'foo:tree',
      children: [{ id: 'foo:child-1' }, { id: 'foo:child-2' }],
    };

    const tree2: N = {
      id: 'bar:tree',
      props: { label: 'hello' },
      children: [{ id: 'bar:child-1' }, { id: 'bar:child-2' }],
    };

    const tree3: N = {
      id: 'zoo:tree',
      children: [{ id: 'zoo:child-1' }, { id: 'zoo:child-2' }],
    };

    it('inserts within parent (new node)', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: 'foo:child-1' });
      const state3 = create({ root: tree3, parent: 'foo:child-1' });
      expect(state1.query.findById('foo:child-1')?.children).to.eql(undefined);

      const res1 = state1.syncFrom({ source: state2 });
      const res2 = state1.syncFrom({ source: state3 });

      expect(res1.parent).to.eql('foo:child-1');
      expect(res2.parent).to.eql('foo:child-1');
      expect(state1.query.findById('foo:child-2')).to.eql({ id: 'foo:child-2' }); // NB: unchanged.

      const node = state1.query.findById('foo:child-1');
      expect(node?.props).to.eql(undefined);
      expect(node?.children?.length).to.eql(2);
      expect((node?.children || [])[0]).to.eql(state2.root);
      expect((node?.children || [])[1]).to.eql(state3.root);
    });

    it('inserts within parent (replace existing node)', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: 'foo:child-1' });
      const state3 = create({ root: tree3, parent: 'foo:child-1' });

      state1.change((draft, ctx) => {
        const node = ctx.findById('foo:child-1');
        if (node) {
          ctx.children(node, (children) => {
            children.push({ id: 'zoo:tree', props: { label: 'banging' } });
          });
        }
      });

      const res1 = state1.syncFrom({ source: state2 });
      const res2 = state1.syncFrom({ source: state3 });
      expect(res1.parent).to.eql('foo:child-1');
      expect(res2.parent).to.eql('foo:child-1');

      const node = state1.query.findById('foo:child-1');
      expect(node?.props).to.eql(undefined);
      expect(node?.children?.length).to.eql(2);
      expect((node?.children || [])[0]).to.eql(state3.root);
      expect((node?.children || [])[1]).to.eql(state2.root);
    });

    it('no initial value inserted into target (observable passed rather than [TreeState])]', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: 'foo:child-1' });
      expect(state1.query.findById('foo:child-1')?.children || []).to.eql([]);

      const res = state1.syncFrom({ source: { event$: state2.event.$, parent: 'foo:child-1' } });
      expect(res.parent).to.eql('foo:child-1');
      expect(state1.query.findById('foo:child-1')?.children || []).to.eql([]); // NB: unchanged.
    });

    it('stays in sync', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: 'foo:child-1' });
      const state3 = create({ root: tree3, parent: 'foo:child-1' });

      state1.syncFrom({ source: state2 });
      state1.syncFrom({ source: state3 });

      const getChildren = () => state1.query.findById('foo:child-1')?.children || [];

      let children = getChildren();
      expect(children).to.eql([state2.root, state3.root]);

      state2.change((draft, ctx) => {
        ctx.children(draft, (children) => {
          ctx.props(draft, (props) => (props.label = 'derp'));
          ctx.props(children[0], (props) => (props.label = 'boo'));
          children.pop();
        });
      });

      children = getChildren();
      expect(children[0].props?.label).to.eql('derp');
      expect(children[0].children?.length).to.eql(1);
      expect((children[0].children || [])[0].props?.label).to.eql('boo');

      state3.change((draft, ctx) => {
        ctx.props(draft, (props) => (props.label = 'barry'));
      });

      children = getChildren();
      expect(children[0].props?.label).to.eql('derp'); // NB: unchanged from last assertion.
      expect(children[1].props?.label).to.eql('barry');
    });

    it('stops syncing on dispose()', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: 'foo:child-1' });
      const state3 = create({ root: tree3, parent: 'foo:child-1' });

      const res1 = state1.syncFrom({ source: state2 });
      const res2 = state1.syncFrom({ source: state3 });

      const getChildren = () => state1.query.findById('foo:child-1')?.children || [];

      expect(res1.isDisposed).to.eql(false);
      expect(res2.isDisposed).to.eql(false);
      res1.dispose();
      expect(res1.isDisposed).to.eql(true);
      expect(res2.isDisposed).to.eql(false);

      state2.change((draft, ctx) => {
        ctx.props(draft, (props) => (props.label = 'change-1'));
      });

      state3.change((draft, ctx) => {
        ctx.props(draft, (props) => (props.label = 'change-2'));
      });

      let children = getChildren();
      expect(children[0].props?.label).to.eql('hello'); // NB: unchanged because syncer disposed.
      expect(children[1].props?.label).to.eql('change-2'); // NB: syncer not yet disposed.

      res2.dispose();
      expect(res2.isDisposed).to.eql(true);

      state3.change((draft, ctx) => {
        ctx.props(draft, (props) => (props.label = 'change-3'));
      });

      children = getChildren();
      expect(children[1].props?.label).to.eql('change-2'); // NB: unchanged from last assertion.
    });

    it('stops syncing when [until$] fires', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: 'foo:child-1' });

      const until$ = new Subject();
      state1.syncFrom({ source: state2, until$ });

      const getChildren = () => state1.query.findById('foo:child-1')?.children || [];

      state2.change((draft, ctx) => {
        ctx.props(draft, (props) => (props.label = 'change-1'));
      });

      let children = getChildren();
      expect(children[0].props?.label).to.eql('change-1');

      until$.next();
      state2.change((draft, ctx) => {
        ctx.props(draft, (props) => (props.label = 'change-2'));
      });

      children = getChildren();
      expect(children[0].props?.label).to.eql('change-1'); // NB: unchanged since last assertion because syncer disposed.
    });

    it('throw: parent not given', () => {
      const test = (source: t.TreeStateSyncSourceArg) => {
        const state = create({ root: tree1 });
        const fn = () => state.syncFrom({ source });
        expect(fn).to.throw(/parent node not specified/);
      };

      test(create({ root: tree2, parent: '' }));
      test(create({ root: tree2, parent: '  ' }));

      const state = create({ root: tree2 });
      test({ event$: state.event.$, parent: '' });
      test({ event$: state.event.$, parent: '  ' });
    });

    it('throw: parent does not exist', () => {
      const state1 = create({ root: tree1 });
      const state2 = create({ root: tree2, parent: '404' });
      const fn = () => state1.syncFrom({ source: state2 });
      expect(fn).to.throw(/parent node '404' does not exist in tree/);
    });
  });

  describe('dispatchable', () => {
    type MyFooEvent = {
      type: 'FOO/event';
      payload: MyFoo;
    };
    type MyFoo = { count: number };

    it('action: dispatches', () => {
      const root: N = { id: 'root' };
      const state = create<N, MyFooEvent>({ root });

      const fired: MyFoo[] = [];
      state
        .action()
        .dispatched('FOO/event')
        .subscribe((e) => fired.push(e));

      state.dispatch({ type: 'FOO/event', payload: { count: 123 } });

      expect(fired.length).to.eql(1);
      expect(fired[0].count).to.eql(123);
    });

    it('action: changed', () => {
      const root: N = { id: 'root' };
      const state = create<N, MyFooEvent>({ root });

      const fired: t.IStateObjectChanged<N, MyFooEvent>[] = [];
      state
        .action()
        .changed('FOO/event')
        .subscribe((e) => fired.push(e));

      state.change((draft, ctx) => (ctx.props(draft).label = 'hello'), { action: 'FOO/event' });
      expect(state.root.props?.label).to.eql('hello');

      expect(fired.length).to.eql(1);
      expect(fired[0].action).to.eql('FOO/event');
      expect(fired[0].to.props?.label).to.eql('hello');
    });

    it('fires action through [dispatch$]', () => {
      const root: N = { id: 'root' };
      const state = create<N, MyFooEvent>({ root });

      const all: t.Event[] = [];
      const dispatched: MyFooEvent[] = [];

      state.event.$.subscribe((e) => all.push(e));
      state.event.dispatch$.subscribe((e) => dispatched.push(e));

      state.dispatch({ type: 'FOO/event', payload: { count: 123 } });

      expect(dispatched.length).to.eql(1);
      expect(dispatched[0].payload.count).to.eql(123);
      expect(all).to.eql(dispatched);
    });
  });

  describe('path', () => {
    const state = create({ root: 'root' });
    const child1 = state.add({ root: { id: 'child-1' } });
    const child2 = child1.add({ root: { id: 'child-2' } });
    const child3 = child1.add({ root: { id: 'child-3' } });

    it('path.from: empty', () => {
      expect(state.path.from('404')).to.eql('');
      expect(state.path.from('  ')).to.eql('');
      expect(state.path.from(undefined as any)).to.eql('');
      expect(state.path.from(null as any)).to.eql('');
    });

    it('path.from: shallow (root)', () => {
      expect(state.path.from(state)).to.eql(state.id);
      expect(state.path.from(state.id)).to.eql(state.id);
    });

    it('path.from: deep', () => {
      const path1 = state.path.from(child1.id);
      const path2 = state.path.from(child2.id);
      const path3 = state.path.from(child3.id);
      expect(path1).to.eql(`${state.id}/${child1.id}`);
      expect(path2).to.eql(`${state.id}/${child1.id}/${child2.id}`);
      expect(path3).to.eql(`${state.id}/${child1.id}/${child3.id}`);
    });

    it('path.get: not found (undefined)', () => {
      expect(state.path.get('foo/404')).to.eql(undefined);
    });

    it('path.get: root', () => {
      const path = state.path.from(state);
      const res = state.path.get(path);
      expect(res?.id).to.eql(state.id);
    });

    it('path.get: deep', () => {
      const path = state.path.from(child2.id);
      const res = state.path.get(path);
      expect(res?.id).to.eql(child2.id);
    });
  });
});
