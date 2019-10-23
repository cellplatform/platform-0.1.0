import { t } from '../common';

export type IGridCell<P extends t.IGridCellProps = t.IGridCellProps> = {
  readonly key: string;
  readonly row: number;
  readonly column: number;
  readonly size: t.ISize;
  readonly width: number;
  readonly height: number;
  readonly siblings: ICellSiblings;
  readonly data: t.ICellData<P>;
  readonly rowspan: number;
  readonly colspan: number;
};

export type ICellSiblings = {
  readonly left?: IGridCell;
  readonly top?: IGridCell;
  readonly right?: IGridCell;
  readonly bottom?: IGridCell;
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
