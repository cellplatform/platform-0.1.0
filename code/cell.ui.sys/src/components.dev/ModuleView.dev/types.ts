import { Observable } from 'rxjs';

import { t } from '../../common';

export * from '../../common/types';

export type MyModuleData = { foo?: string };
export type MyModule = t.IModule<MyModuleData>;

export type MyContext = {
  fire: t.FireEvent<any>;
  event$: Observable<t.Event>;
};
