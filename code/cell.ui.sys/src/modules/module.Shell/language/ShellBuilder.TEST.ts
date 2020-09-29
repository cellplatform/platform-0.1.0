import { builder } from '.';
import { Shell } from '..';
import { expect, rx } from '../../../test';
import { Module, t } from '../common';
import { create, TestModule } from '../module/Module.TEST';

const data = (module: t.ShellModule) => module.state.props?.data as t.ShellData;
const tree = (module: TestModule) => module.state.props?.treeview || {};

describe('ShellBuilder (DSL)', () => {
  describe('create', () => {
    it('throw: module not provided', () => {
      const fn = () => builder(rx.bus());
      expect(fn).to.throw(/A module of kind 'Shell' could not be found/);
    });

    it('create: uses given module', () => {
      const bus = rx.bus();
      const shell = Shell.module(bus);
      expect(data(shell).name).to.eql('');

      builder(bus, { shell }).name('foo');
      expect(data(shell).name).to.eql('foo');
    });

    it('create: retrieves existing module (lookup)', () => {
      const bus = rx.bus();
      const shell = Shell.module(bus);
      expect(data(shell).name).to.eql('');

      Module.register(bus, shell);
      const api = builder(bus);

      api.name('foo');
      expect(data(shell).name).to.eql('foo');
    });
  });

  describe('root', () => {
    it('name', () => {
      const { api, data } = create.shell();
      api.name('foo').name('  bar  ');
      expect(data().name).to.eql('bar');
    });
  });

  describe('registration', () => {
    it('add (no parent)', () => {
      const { api, bus, shell } = create.shell();
      const test = create.test(bus).module;

      const fired: t.IShellAdd[] = [];
      rx.payload<t.IShellAddEvent>(bus.event$, 'Shell/add').subscribe((e) => fired.push(e));

      const res = api.add(test);
      expect(typeof res.parent === 'function').to.eql(true);

      expect(fired.length).to.eql(1);
      expect(fired[0].shell).to.eql(shell.id);
      expect(fired[0].module).to.eql(test.id);
      expect(fired[0].parent).to.eql('');
    });

    it('add (within parent)', () => {
      const { api, bus, shell } = create.shell();
      const test1 = create.test(bus).module;
      const test2 = create.test(bus).module;

      const fired: t.IShellAdd[] = [];
      rx.payload<t.IShellAddEvent>(bus.event$, 'Shell/add').subscribe((e) => fired.push(e));

      api.add(test1);
      api.add(test2, test1);

      expect(fired.length).to.eql(2);

      expect(fired[0].shell).to.eql(shell.id);
      expect(fired[0].module).to.eql(test1.id);
      expect(fired[0].parent).to.eql('');

      expect(fired[1].shell).to.eql(shell.id);
      expect(fired[1].module).to.eql(test2.id);
      expect(fired[1].parent).to.eql(test1.id);
    });
  });

  describe('module', () => {
    it('throw: module not added', () => {
      const { api } = create.shell();
      const fn = () => api.module('404');
      expect(fn).to.throw(/has not been added to the shell/);
    });

    it('retrieve by {node}', () => {
      const { api, bus } = create.shell();
      const test = create.test(bus).module;

      api.add(test);
      expect(api.module(test).parent()).to.equal(api);
    });

    it('retrieve by "id"', () => {
      const { api, bus } = create.shell();
      const test = create.test(bus).module;

      api.add(test);
      expect(api.module(test.id).parent()).to.equal(api);
    });

    it('label (tree)', () => {
      const { api, bus } = create.shell();
      const test = create.test(bus).module;

      api.add(test).label(' foo ');
      expect(tree(test).label).to.eql('foo');
    });
  });

  describe('tree (node)', () => {
    it('parent', () => {
      const { api, bus } = create.shell();
      const test = create.test(bus).module;
      const module = api.add(test);
      const tree = module.tree;
      expect(tree.parent()).to.equal(module);
      expect(tree.parent().parent()).to.equal(api);
    });

    it('label', () => {
      const { api, bus } = create.shell();
      const test = create.test(bus).module;
      api.add(test).tree.label('foo').label('  bar  ');
      expect(tree(test).label).to.eql('bar');
    });
  });
});
