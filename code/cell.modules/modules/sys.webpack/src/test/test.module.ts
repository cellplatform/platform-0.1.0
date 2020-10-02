import { t, rx, Module, id } from '../common';

type E = t.WebpackEvent;

export type TestView = 'Default' | '404';
export type TestRegion = 'Main';
export type TestData = { count: number };
export type TestProps = t.IViewModuleProps<TestData, TestView, TestRegion>;
export type TestModule = t.IModule<TestProps>;

export const create = {
  // shell(input?: t.EventBus<any>) {
  //   const bus = input || rx.bus<E>();
  //   const fire = Module.fire(bus);
  //   const shell = Shell.module(bus);
  //   Module.register(bus, shell);
  //   const api = Shell.builder(bus);
  //   return { bus, api, shell, fire, data: () => data(shell) };
  // },
  test(input?: t.EventBus<any>) {
    const bus = (input || rx.bus<E>()) as t.EventBus<E>;
    const module = Module.create<TestProps>({
      bus,
      kind: 'TEST',
      root: `${id.shortid()}.test`,
    });
    return { bus, module };
  },
};
