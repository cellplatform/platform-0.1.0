export * from '@platform/log/lib/types';
export * from '@platform/cell.types';

export * from '../../types';

import * as t from '../../types';
import {
  ITypedSheet,
  ITypedSheetRow,
  ITypedSheetRefs,
  IClientTypesystem,
} from '@platform/cell.types';

export type IAppCtx = {
  host: string;
  client: IClientTypesystem;
  sheet: ITypedSheet<t.SysApp>;
  app: ITypedSheetRow<t.SysApp>;
  windows: ITypedSheetRefs<t.SysAppWindow>;
  windowDefs: ITypedSheetRefs<t.SysAppWindowDef>;
};
