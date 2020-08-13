import { Observable } from 'rxjs';

import { t } from '../../common';

export * from '../../common/types';

export type MyView = 'TREE' | 'DIAGRAM' | 'SAMPLE';
export type MyData = { foo?: string | number };
export type MyProps = t.IModuleProps<MyData, MyView>;
export type MyModule = t.IModule<MyProps>;

export type MyContext = {
  fire: t.FireEvent<any>;
  event$: Observable<t.Event>;
};
