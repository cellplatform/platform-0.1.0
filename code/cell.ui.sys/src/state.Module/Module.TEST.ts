import { Observable } from 'rxjs';

import { Module } from '.';
import { t, expect } from '../test';

export type MyModuleData = { msg?: string; count: number };
export type MyModule = t.IModule<MyModuleData, MyModuleEvent>;

export type MyModuleEvent = MyFooEvent;
export type MyFooEvent = { type: 'FOO/event'; payload: MyFoo };
export type MyFoo = { count: number };

const create = (args: { dispose$?: Observable<any> } = {}) => {
  return Module.create<MyModuleData, MyFooEvent>({
    ...args,
    strategy: Module.strategies.default,
  });
};

describe.only('Module', () => {
  describe('lifecycle', () => {
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

    it('register (child)', async () => {
      const module = create();
      const child = await Module.register(module, { id: 'foo', name: 'MyFoo' });

      const root = child.root;
      expect(Module.identity.hasNamespace(root.id)).to.eql(true);
      expect(Module.identity.key(root.id)).to.eql('foo');

      expect(root.props?.kind).to.eql('MODULE');
      expect(root.props?.data).to.eql({});
      expect(root.props?.view).to.eql('');
      expect(root.props?.treeview).to.eql({ label: 'MyFoo' });
    });
  });
});
