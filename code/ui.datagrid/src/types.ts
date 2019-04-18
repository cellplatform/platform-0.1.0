import * as t from '@platform/ui.datagrid.types';

export { KeypressObservable } from '@platform/react';
export * from '@platform/ui.datagrid.types';

export * from '@platform/ui.codemirror/lib/types';
export * from '@platform/ui.editor/lib/types';
export * from '@platform/ui.text/lib/components/TextInput/types';

export * from './components/render/types';

export type IInitialGridState = {
  selection?:
    | string
    | {
        cell: t.CellRef;
        ranges?: t.GridCellRangeKey[];
      };
};
