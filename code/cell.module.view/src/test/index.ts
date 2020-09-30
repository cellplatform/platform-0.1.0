export { Observable, Subject } from 'rxjs';
export { expect, expectError } from '@platform/test';
import { rx, id, t } from '../common';
import { Module } from '..';

export * from '../common';

export type TestView = 'Default' | '404';
export type TestRegion = 'Main';
export type TestData = { count: number };
export type TestProps = t.IViewModuleProps<TestData, TestView, TestRegion>;
export type TestModule = t.IModule<TestProps>;

export const create = {
  bus: () => rx.bus(),
  testModule(input?: t.EventBus<any>) {
    const bus = input || rx.bus();
    const root = `${id.shortid()}.test`;
    const module = Module.create<TestProps>({ bus, kind: 'TEST', root });
    return { bus, module };
  },
};
