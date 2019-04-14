import * as t from '../../types';

export type IInitialGridState = {
  selection?:
    | string
    | {
        cell: t.CellRef;
        ranges?: t.GridCellRangeKey[];
      };
};
