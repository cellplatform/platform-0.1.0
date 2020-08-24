import * as React from 'react';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Module } from '.';
import { expect, t } from '../test';

type MyView = 'View-1' | 'View-2';
type MyData = { msg?: string; count: number };
type MyProps = t.IModuleProps<MyData, MyView>;
type MyModule = t.IModule<MyProps>;

const event$ = new Subject<t.Event>();
const events = Module.events(event$);
const bus: t.EventBus = { fire: (e: t.Event) => event$.next(e), event$ };
const fire = Module.fire(bus);

const create = <P extends MyProps = MyProps>(
  args: { root?: string | t.ITreeNode<P>; view?: MyView; data?: MyData } = {},
) => {
  return Module.create<P>({ ...args, bus });
};

describe('Module', () => {
  describe('create', () => {
    it('create', () => {
      const module = create();

      const root = module.root;
      expect(Module.Identity.hasNamespace(root.id)).to.eql(true);
      expect(Module.Identity.key(root.id)).to.eql('module');

      expect(root.props?.kind).to.eql('MODULE');
      expect(root.props?.data).to.eql({});
      expect(root.props?.view).to.eql('');
      expect(root.props?.treeview).to.eql({ label: 'Unnamed' });
    });

    it('throw: id contains "/" character', () => {
      const fn = () => create({ root: 'foo/bar' });
      expect(fn).to.throw(/cannot contain the "\/"/);
    });
  });

  describe('event: "Module/register"', () => {
    it('fires module registration events', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      const register: t.IModuleRegister[] = [];
      const registered: t.IModuleRegistered[] = [];
      const childEvents = events.filter((e) => e.module === child.id);

      childEvents.register$.subscribe((e) => register.push(e));
      childEvents.registered$.subscribe((e) => registered.push(e));

      // Module.events(event$).
      const res = Module.register(bus, child, parent.id); // NB: convenience alternative to using the [fire] helper (pass-through).

      expect(res.ok).to.eql(true);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent?.id).to.eql(parent.id);

      expect(register.length).to.eql(1);
      expect(register[0].module).to.eql(child.id);
      expect(register[0].parent).to.eql(parent.id);

      expect(registered.length).to.eql(1);
      expect(registered[0].module).to.eql(child.id);
      expect(registered[0].parent).to.eql(parent.id);
    });

    it('fires "Module/child/registered"', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      const fired: t.IModuleChildRegistered[] = [];
      const events = Module.events(parent);
      events.childRegistered$.subscribe((e) => fired.push(e));

      const res = fire.register(child, parent.id);

      expect(res.ok).to.eql(true);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent?.id).to.eql(parent.id);

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].child).to.eql(child.id);
    });

    it('inserts child within parent', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      expect(parent.find((e) => e.id === child.id)).to.eql(undefined);
      fire.register(child, parent.id);
      expect(parent.find((e) => e.id === child.id)).to.equal(child);
    });

    it('parent not found', () => {
      const child = create({ root: 'child' });
      const res = fire.register(child, '404');

      expect(res.ok).to.eql(false);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent).to.eql(undefined);
    });

    it('parent not specified - catch all completes registration', () => {
      const root = create({ root: 'parent' });
      const child = create({ root: 'child' });

      // Catch un-targetted (wildcard) registrations and route then into the root.
      events.register$.pipe(filter((e) => !e.parent)).subscribe((e) => {
        const module = fire.request(e.module).module;
        if (module) {
          Module.register(bus, module, root.id);
        }
      });

      const res = fire.register(child);

      expect(res.ok).to.eql(true);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent?.id).to.eql(root.id);
      expect(root.find((e) => e.id === child.id)).to.equal(child);
    });
  });

  describe('event: "Module/child/disposed"', () => {
    it('fires child disposed event', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });

      const fired: t.IModuleChildDisposed[] = [];
      events.childDisposed$.subscribe((e) => fired.push(e));

      fire.register(child, parent.id);
      child.dispose();

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].child).to.eql(child.id);
    });

    it('removes child from parent', () => {
      const parent = create({ root: 'parent' });
      const child = create({ root: 'child' });
      fire.register(child, parent.id);
      expect(parent.find((e) => e.id === child.id)).to.equal(child);

      child.dispose();
      expect(parent.find((e) => e.id === child.id)).to.eql(undefined);
    });
  });

  describe('event: "Module/request"', () => {
    it('finds module: complete id', () => {
      const module = create();
      const res = Module.fire(bus).request(module.id);
      expect(res.module?.id).to.eql(module.id);
    });

    it('finds module: wildcard ("*:id")', () => {
      const module = create({ root: 'foo' });
      const res = Module.fire(bus).request('*:foo');
      expect(res.module?.id).to.eql(module.id);
    });

    it('not found', () => {
      const res = Module.fire(bus).request('ns:404');
      expect(res.module).to.eql(undefined);
    });
  });

  describe('event: "Module/render"', () => {
    const events = Module.events<MyProps>(event$);
    const module = create();
    const fireRender = (view: MyProps['view']) => fire.render({ module: module.id, view });

    it('matches specific events', () => {
      const fired: t.IModuleRender<any>[] = [];
      events.render('View-1').subscribe((e) => fired.push(e));

      fireRender('View-1');
      fireRender('View-2');

      expect(fired.length).to.eql(1);
      expect(fired[0].view).to.eql('View-1');
    });

    it('matches all events ("view" undefined)', () => {
      const fired: t.IModuleRender<any>[] = [];
      events.render().subscribe((e) => fired.push(e));

      fireRender('View-1');
      fireRender('View-2');
      expect(fired.length).to.eql(2);
    });

    it('does not fire for handled events', () => {
      const fired: string[] = [];

      events.render('View-1').subscribe((e) => {
        fired.push('first');
        e.render(<div>hello</div>);
      });
      events.render('View-1').subscribe((e) => fired.push('second'));

      fireRender('View-1');
      expect(fired.length).to.eql(1);
      expect(fired[0]).to.eql('first');
    });
  });

  describe('event: "Module/selection"', () => {
    it('from root: tree-node', () => {
      const parent = create({ root: 'parent', view: 'View-1', data: { count: 123 } });
      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root: parent.root, selected: parent.id });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].selection?.id).to.eql(parent.id);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].data).to.eql({ count: 123 });
    });

    it('from root: module', () => {
      const root = create({ root: 'parent', view: 'View-1', data: { count: 123 } });
      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root, selected: root.id });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(root.id);
      expect(fired[0].selection?.id).to.eql(root.id);
      expect(fired[0].view).to.eql('View-1');
      expect(fired[0].data).to.eql({ count: 123 });
    });

    it('fires event through child modules only', () => {
      const root = create({ root: 'parent' });
      const child1 = create({
        root: {
          id: 'child-1',
          props: { view: 'View-1' },
          children: [
            {
              id: 'child-1.1',
              props: { data: { count: 123 }, view: 'View-2', treeview: { label: 'Hello' } },
            },
            {
              id: 'child-1.2',
            },
          ],
        },
      });
      const child2 = create({
        root: { id: 'child-2', children: [{ id: 'child-2.1' }, { id: 'child-2.2' }] },
      });

      fire.register(child1, root.id);
      fire.register(child2, root.id);

      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      const selection1 = `${child1.namespace}:child-1.1`;
      const selection2 = `${child1.namespace}:child-1.2`;

      fire.selection({ root, selected: selection1 });
      fire.selection({ root, selected: selection2 });

      expect(fired.length).to.eql(2);

      expect(fired[0].module).to.eql(child1.id);
      expect(fired[0].selection?.id).to.eql(selection1);
      expect(fired[0].selection?.props).to.eql({ label: 'Hello' });
      expect(fired[0].data).to.eql({ count: 123 });
      expect(fired[0].view).to.eql('View-2'); // NB: specified on node, overrides parent module view.

      expect(fired[1].module).to.eql(child1.id);
      expect(fired[1].selection?.id).to.eql(selection2);
      expect(fired[1].selection?.props).to.eql({});
      expect(fired[1].data).to.eql({});
      expect(fired[1].view).to.eql('View-1'); // NB: not specified on node, taken from parent module (default).
    });

    it('clears selection', () => {
      const root = create({ root: 'parent', view: 'View-1' });
      const child = create({ root: 'child', view: 'View-2', data: { count: 123 } });
      fire.register(child, root.id);

      const fired: t.IModuleSelection<any>[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root, selected: child.id });
      fire.selection({ root });

      expect(fired.length).to.eql(2);
      expect(fired[1].module).to.eql(root.id);
      expect(fired[1].selection).to.eql(undefined);
    });

    it('throw: node does not exist in tree', () => {
      const root = create({ root: 'parent', view: 'View-1' });
      const fn = () => fire.selection({ root, selected: '404' });
      expect(fn).to.throw(/node does not exist/);
    });
  });
});
