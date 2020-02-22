import * as t from '@platform/ui.datagrid.types';

export * from '@platform/ui.datagrid.types';

export * from './render/types';

export type IInitialGridState = {
  selection?:
    | string
    | {
        cell: t.GridCellRef;
        ranges?: t.GridCellRangeKey[];
      };
};
