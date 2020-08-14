import * as React from 'react';
import { Observable, Subject } from 'rxjs';

import { Module } from '.';
import { expect, t } from '../test';

type MyView = 'View-1' | 'View-2';
type MyData = { msg?: string; count: number };
type MyProps = t.IModuleProps<MyData, MyView>;
type MyModule = t.IModule<MyProps>;

const event$ = new Subject<t.Event>();
const bus: t.EventBus = { fire: (e: t.Event) => event$.next(e), event$ };
const fire = Module.fire(bus);

const create = (args: { root?: string; dispose$?: Observable<any> } = {}) => {
  return Module.create<MyProps>({ ...args, bus });
};

describe('Module', () => {
  describe('create', () => {
    it('create', () => {
      const module = create();

      const root = module.root;
      expect(Module.identity.hasNamespace(root.id)).to.eql(true);
      expect(Module.identity.key(root.id)).to.eql('module');

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

  describe('register', () => {
    it('registers within parent', () => {
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

    it('parent not found', () => {
      const child = create({ root: 'child' });
      const res = fire.register(child, '404');

      expect(res.ok).to.eql(false);
      expect(res.module.id).to.eql(child.id);
      expect(res.parent).to.eql(undefined);
    });
  });

  describe('Module.events', () => {
    describe('event: Module/render', () => {
      const events = Module.events<MyProps>(event$);
      const module = create();
      const fireRender = (view: MyProps['view']) =>
        Module.fire(bus).render({ module: module.id, tree: {}, view });

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

    describe('event: Module/request', () => {
      it('finds module', () => {
        const module = create();
        const res = Module.fire(bus).request(module.id);
        expect(res.module?.id).to.eql(module.id);
      });

      it('not found', () => {
        const res = Module.fire(bus).request('ns:404');
        expect(res.module).to.eql(undefined);
      });
    });
  });
});
