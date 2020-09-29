import { expect, rx } from '../../../test';
import { t, Module, id } from '../common';
import { builder } from '.';
import { Shell } from '..';

type TestView = 'Default' | '404';
type TestRegion = 'Main';
type TestData = { count: number };
type TestProps = t.IViewModuleProps<TestData, TestView, TestRegion>;
type TestModule = t.IModule<TestProps>;

const create = {
  shell(bus?: t.EventBus) {
    bus = bus || rx.bus();
    const fire = Module.fire(bus);
    const module = Shell.module(bus);
    Module.register(bus, module);
    const api = builder(bus);
    return { bus, api, module, fire, data: () => data(module) };
  },
  test(bus?: t.EventBus) {
    bus = bus || rx.bus();
    const module = Module.create<TestProps>({ bus, kind: 'TEST', root: `${id.shortid()}.test` });
    return { bus, module };
  },
};

const data = (shell: t.ShellModule): t.ShellData => shell.state.props?.data;

describe.only('ShellBuilder (DSL)', () => {
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
      api.name('foo').name('bar');
      expect(data().name).to.eql('bar');
    });
  });

  describe('module', () => {
    describe('module.add', () => {
      it.only('registers new module within the shell', () => {
        const { api, bus, fire } = create.shell();
        const test = create.test(bus).module;
        // const fire = Module.fire(bus);

        const f = fire.find({ module: test.id });
        console.log('f', f.length, f[0].id);

        // Module.r
        // fire.

        // expect(fire.find({ module: test.id })).to.eql([]);
        api.modules.add(test);

        console.log('-------------------------------------------');

        const res = fire.find({ module: test.id });

        // res.forEach((r) => {
        //   console.log('r.id', r.id, r.parent, r.path);
        //   // r.parent;
        // });

        // console.log('res', res);
      });
    });
  });
});
