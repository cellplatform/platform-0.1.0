import { expect, rx } from '../../test';
import { t, Module, id } from './common';
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

describe.only('Shell (Module)', () => {
  it('create', () => {
    const module = Shell.module(bus);
    expect(module.id).to.match(/.{20,}\:.{7}\.shell$/);
    expect(data(module).name).to.eql('');
  });

  describe('event: "Shell/add"', () => {
    it('stores registration reference (root)', () => {
      const { shell, bus, data } = create.shell();
      const test = create.test(bus).module;

      bus.fire({ type: 'Shell/add', payload: { shell: shell.id, module: test.id } });

      console.log('-------------------------------------------');
      console.log('data()', data());
    });
  });
});
