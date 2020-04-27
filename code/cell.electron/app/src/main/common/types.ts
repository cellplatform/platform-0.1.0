export * from '@platform/log/lib/types';
export * from '@platform/cell.types';

export * from '../../types';

import * as t from '../../types';
import { ITypedSheet, ITypedSheetRow, ITypedSheetRefs } from '@platform/cell.types';

export type IAppCtx = {
  host: string;
  sheet: ITypedSheet<t.CellApp>;
  app: ITypedSheetRow<t.CellApp>;
  windows: ITypedSheetRefs<t.CellAppWindow>;
  windowDefs: ITypedSheetRefs<t.CellAppWindowDef>;
};
