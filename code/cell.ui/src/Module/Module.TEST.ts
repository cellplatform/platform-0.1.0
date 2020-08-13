import { Subject, Observable } from 'rxjs';

import { Module } from '.';
import { t, expect } from '../test';

export type MyView = 'View-1' | 'View-2';
export type MyData = { msg?: string; count: number };
export type MyProps = t.IModuleProps<MyData, MyView>;
export type MyModule = t.IModule<MyProps>;

const create = (args: { dispose$?: Observable<any>; event$?: Observable<t.Event> } = {}) => {
  return Module.create<MyProps>({ ...args });
};

describe.only('Module', () => {
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

  describe('register', () => {
    it('with all arguments', () => {
      const parent = create();
      const res = Module.register<MyProps>(parent).add({
        id: 'foo',
        treeview: 'MyFoo',
        view: 'View-1',
        data: { count: 123 },
      });

      const child = res.module;
      const root = child.root;

      expect(res.id).to.eql(res.module.id);
      expect(res.path).to.eql(`${parent.id}/${child.id}`);

      expect(Module.identity.hasNamespace(root.id)).to.eql(true);
      expect(Module.identity.key(root.id)).to.eql('foo');

      expect(root.props?.kind).to.eql('MODULE');
      expect(root.props?.data).to.eql({});
      expect(root.props?.view).to.eql('View-1');
      expect(root.props?.treeview).to.eql({ label: 'MyFoo' });
    });

    it('without optional arguments', () => {
      const parent = create();
      const res = Module.register(parent).add({ id: 'foo' });
      const root = res.module.root;
      expect(root.props?.treeview).to.eql({ label: 'Unnamed' });
      expect(root.props?.view).to.eql('');
      expect(root.props?.data).to.eql({});
    });

    it('with {treeview} node argument', () => {
      const parent = create();
      const res = Module.register(parent).add({ id: 'foo', treeview: { icon: 'Face' } });

      const treeview = res.module.root.props?.treeview || {};
      expect(treeview.label).to.eql(undefined);
      expect(treeview.icon).to.eql('Face');
    });

    it('throw: id contains "/" character', () => {
      const parent = create();
      const fn = () => Module.register(parent).add({ id: 'foo/bar' });
      expect(fn).to.throw(/cannot contain the "\/"/);
    });

    it('event: Module/registered', () => {
      const parent = create();

      const fired: t.IModuleChildRegistered[] = [];
      const events = Module.events(parent);
      events.childRegistered$.subscribe((e) => fired.push(e));

      const res = Module.register(parent).add({ id: 'foo' });
      const child = res.module;

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].path).to.eql(`${parent.id}/${child.id}`);
    });

    it('event: Module/dispose', () => {
      const parent = create();
      const child = Module.register(parent).add({ id: 'foo' }).module;

      const fired: t.IModuleChildDisposed[] = [];
      const events = Module.events(parent);
      events.childDisposed$.subscribe((e) => fired.push(e));

      child.dispose();

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].path).to.eql(`${parent.id}/${child.id}`);
    });
  });

  describe('event: Module/request', () => {
    const event$ = new Subject<t.Event>();
    const next = (e: t.Event) => event$.next(e);

    it('finds module', () => {
      const parent = create({ event$ });
      const child1 = Module.register(parent).add({ id: 'foo' }).module;
      const child2 = Module.register(child1).add({ id: 'bar' }).module;

      const res = Module.request(next, child2.id);

      expect(res.module?.id).to.eql(child2.id);
      expect(res.path).to.eql(`${parent.id}/${child1.id}/${child2.id}`);
    });

    it('not found', () => {
      const parent = create({ event$ });
      Module.register(parent).add({ id: 'foo' }).module;

      const res = Module.fire(next).request('ns:404');
      expect(res.module).to.eql(undefined);
      expect(res.path).to.eql('');
    });
  });
});
