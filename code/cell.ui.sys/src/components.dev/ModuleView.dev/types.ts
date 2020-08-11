import { Observable } from 'rxjs';

import { t } from '../../common';

export * from '../../common/types';

export type MyModuleData = { foo?: string };
export type MyModule = t.IModule<MyModuleData>;
export type MyContext = {
  event$: Observable<t.Event>;
  fire: t.FireEvent<t.Event>;
};
