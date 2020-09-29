import { expect, rx } from '../../../test';
import { t, Module, id } from '../common';
import { Shell } from '.';

type E = t.ShellEvent;

export type TestView = 'Default' | '404';
export type TestRegion = 'Main';
export type TestData = { count: number };
export type TestProps = t.IViewModuleProps<TestData, TestView, TestRegion>;
export type TestModule = t.IModule<TestProps>;

export const create = {
  shell(input?: t.EventBus<any>) {
    const bus = input || rx.bus<E>();
    const fire = Module.fire(bus);
    const shell = Shell.module(bus);
    Module.register(bus, shell);
    const api = Shell.builder(bus);
    return { bus, api, shell, fire, data: () => data(shell) };
  },
  test(input?: t.EventBus<any>) {
    const bus = (input || rx.bus<E>()) as t.EventBus<E>;
    const module = Module.create<TestProps>({ bus, kind: 'TEST', root: `${id.shortid()}.test` });
    return { bus, module };
  },
};

const bus = rx.bus<E>();
const data = (shell: t.ShellModule) => shell.state.props?.data as t.ShellData;

describe('Shell (Module)', () => {
  it('create', () => {
    const module = Shell.module(bus);
    expect(module.id).to.match(/.{20,}\:.{7,10}\.shell$/);
    expect(data(module).name).to.eql('');
  });

  describe('event: "Shell/add"', () => {
    it('does not store registration (different shell)', () => {
      const { bus, data } = create.shell();
      const test = create.test(bus).module;

      bus.fire({ type: 'Shell/add', payload: { shell: 'foo', module: test.id } });
      expect(data().registrations).to.eql(undefined);
    });

    it('stores registration references', () => {
      const { shell, bus, data } = create.shell();
      const t1 = create.test(bus).module;
      const t2 = create.test(bus).module;
      const registrations = () => data().registrations || [];

      expect(data().registrations).to.eql(undefined);

      bus.fire({ type: 'Shell/add', payload: { shell: shell.id, module: t1.id } });

      expect(registrations().length).to.eql(1);
      expect(registrations()[0].module).to.eql(t1.id);
      expect(registrations()[0].parent).to.eql(shell.id);

      bus.fire({ type: 'Shell/add', payload: { shell: shell.id, module: t2.id, parent: t1.id } });

      expect(registrations().length).to.eql(2);
      expect(registrations()[1].module).to.eql(t2.id);
      expect(registrations()[1].parent).to.eql(t1.id);
    });

    it('removes registration (single)', () => {
      const { shell, bus, data } = create.shell();
      const test = create.test(bus).module;
      const registrations = () => data().registrations || [];

      bus.fire({ type: 'Shell/add', payload: { shell: shell.id, module: test.id } });

      expect(registrations()[0].module).to.eql(test.id);
      expect(registrations()[0].parent).to.eql(shell.id);

      test.dispose();
      expect(registrations()).to.eql([]);
    });

    it('removes registration (deep)', () => {
      const { shell, bus, data } = create.shell();
      const t1 = create.test(bus).module;
      const t2 = create.test(bus).module;

      const registrations = () => data().registrations || [];

      bus.fire({ type: 'Shell/add', payload: { shell: shell.id, module: t1.id } });
      bus.fire({ type: 'Shell/add', payload: { shell: shell.id, module: t2.id, parent: t1.id } });

      t1.dispose(); // NB: Disposing of root also disposes child modules.
      expect(registrations()).to.eql([]);
    });
  });
});
