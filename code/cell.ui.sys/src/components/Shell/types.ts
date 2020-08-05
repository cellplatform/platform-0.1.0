import { t } from '../../common';

export * from '../../common/types';

export type MyModuleData = { selected?: string };
export type MyModule = t.IModule<MyModuleData, MyFooEvent>;

export type MyFooEvent = { type: 'FOO/event'; payload: MyFoo };
export type MyFoo = { count: 123 };

