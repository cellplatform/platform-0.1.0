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

const create = (args: { root?: string; view?: MyView; data?: MyData } = {}) => {
  return Module.create<MyProps>({ ...args, bus });
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

  describe('event: "Module/render"', () => {
    const events = Module.events<MyProps>(event$);
    const module = create();
    const fireRender = (view: MyProps['view']) => fire.render({ module: module.id, view });

    it('matches specific events', () => {
      const fired: t.IModuleRender[] = [];
      events.render('View-1').subscribe((e) => fired.push(e));

      fireRender('View-1');
      fireRender('View-2');

      expect(fired.length).to.eql(1);
      expect(fired[0].view).to.eql('View-1');
    });

    it('matches all events ("view" undefined)', () => {
      const fired: t.IModuleRender[] = [];
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

  describe('event: "Module/selection"', () => {
    it('from root: tree-node', () => {
      const parent = create({ root: 'parent', view: 'View-1' });
      const child = create({ root: 'child', view: 'View-2', data: { count: 123 } });
      fire.register(child, parent.id);

      const fired: t.IModuleSelection[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root: parent.root, current: parent.id, selected: child.id });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].tree.current).to.eql(parent.id);
      expect(fired[0].tree.selection?.id).to.eql(child.id);
      expect(fired[0].view).to.eql('View-2');
      expect(fired[0].data).to.eql({ count: 123 });
    });

    it('from root: module', () => {
      const root = create({ root: 'parent', view: 'View-1' });
      const child = create({ root: 'child', view: 'View-2', data: { count: 123 } });
      fire.register(child, root.id);

      const fired: t.IModuleSelection[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root, current: root.id, selected: child.id });

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(root.id);
      expect(fired[0].tree.current).to.eql(root.id);
      expect(fired[0].tree.selection?.id).to.eql(child.id);
      expect(fired[0].view).to.eql('View-2');
      expect(fired[0].data).to.eql({ count: 123 });
    });

    it('clears selection', () => {
      const root = create({ root: 'parent', view: 'View-1' });
      const child = create({ root: 'child', view: 'View-2', data: { count: 123 } });
      fire.register(child, root.id);

      const fired: t.IModuleSelection[] = [];
      events.selection$.subscribe((e) => fired.push(e));

      fire.selection({ root, current: root.id, selected: child.id });
      fire.selection({ root });

      expect(fired.length).to.eql(2);
      expect(fired[1].module).to.eql(root.id);
      expect(fired[1].tree.current).to.eql(undefined);
      expect(fired[1].tree.selection).to.eql(undefined);
    });
  });
});
