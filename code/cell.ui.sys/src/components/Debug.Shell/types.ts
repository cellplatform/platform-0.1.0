import { t } from '../../common';

export * from '../../common/types';

export type MyModuleData = { foo: number };

export type MyFooEvent = { type: 'FOO/event'; payload: MyFoo };
export type MyFoo = { count: 123 };

export type MyModule = t.IModule<MyModuleData, MyFooEvent>;
