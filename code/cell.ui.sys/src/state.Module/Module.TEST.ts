import { Observable } from 'rxjs';

import { Module } from '.';
import { t, expect } from '../test';

export type MyModuleData = { msg?: string; count: number };
export type MyModule = t.IModule<MyModuleData>;

const create = (args: { dispose$?: Observable<any> } = {}) => {
  return Module.create<MyModuleData>({ ...args });
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
      const res = Module.register<MyModule>(parent, {
        id: 'foo',
        label: 'MyFoo',
        view: 'MyView',
        data: { foo: 123 },
      });
      const child = res.module;

      const root = child.root;
      expect(Module.identity.hasNamespace(root.id)).to.eql(true);
      expect(Module.identity.key(root.id)).to.eql('foo');

      expect(root.props?.kind).to.eql('MODULE');
      expect(root.props?.data).to.eql({});
      expect(root.props?.view).to.eql('MyView');
      expect(root.props?.treeview).to.eql({ label: 'MyFoo' });
    });

    it('without optional arguments', () => {
      const parent = create();
      const res = Module.register(parent, { id: 'foo' });
      const root = res.module.root;
      expect(root.props?.treeview).to.eql({ label: 'Unnamed' });
      expect(root.props?.view).to.eql('');
      expect(root.props?.data).to.eql({});
    });

    it('throw: id contains "/" character', () => {
      const parent = create();
      const fn = () => Module.register(parent, { id: 'foo/bar' });
      expect(fn).to.throw(/cannot contain the "\/"/);
    });

    it('event: Module/registered', () => {
      const parent = create();
      const events = Module.events(parent);

      const fired: t.IModuleChildRegistered[] = [];
      events.registered$.subscribe((e) => fired.push(e));

      const res = Module.register(parent, { id: 'foo' });
      const child = res.module;

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].path).to.eql(`${parent.id}/${child.id}`);
    });

    it('event: Module/dispose', () => {
      const parent = create();
      const events = Module.events(parent);

      const fired: t.IModuleChildDisposed[] = [];
      events.childDisposed$.subscribe((e) => fired.push(e));

      const res = Module.register(parent, { id: 'foo' });
      const child = res.module;
      child.dispose();

      expect(fired.length).to.eql(1);
      expect(fired[0].module).to.eql(parent.id);
      expect(fired[0].path).to.eql(`${parent.id}/${child.id}`);
    });
  });
});
