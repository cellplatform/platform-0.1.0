import { t } from '../common';
import { Diff } from '@platform/util.diff/lib/types';

export type IGridCell<P extends t.IGridCellProps = t.IGridCellProps> = {
  readonly key: string;
  readonly row: number;
  readonly column: number;
  readonly size: t.ISize;
  readonly width: number;
  readonly height: number;
  readonly siblings: ICellSiblings;
  readonly value: t.CellValue;
  readonly props: P;
  readonly rowspan: number;
  readonly colspan: number;
};

export type ICellSiblings = {
  readonly left?: IGridCell;
  readonly top?: IGridCell;
  readonly right?: IGridCell;
  readonly bottom?: IGridCell;
};

export type ICellDiff = {
  readonly left: t.IGridCellData;
  readonly right: t.IGridCellData;
  readonly isDifferent: boolean;
  readonly list: Array<Diff<t.IGridCellData>>;
};

/**
 * [Events]
 */

export type IGridCellChange = {
  cell: t.ICoordCell;
  value: { from?: t.IGridCellData; to?: t.IGridCellData };
  isCancelled: boolean;
  isChanged: boolean;
  isModified: boolean;
  cancel(): void;
  modify(value: t.CellValue): void;
};
