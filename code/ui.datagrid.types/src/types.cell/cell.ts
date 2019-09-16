import { t } from '../common';
import { Diff } from 'deep-diff';

export type ICell<P extends ICellProps = ICellProps> = {
  readonly row: number;
  readonly column: number;
  readonly key: string;
  readonly size: t.ISize;
  readonly width: number;
  readonly height: number;
  readonly siblings: ICellSiblings;
  readonly value: t.CellValue;
  readonly props: P;
  rowspan: number;
  colspan: number;
};

export type ICellSiblings = {
  readonly left?: ICell;
  readonly top?: ICell;
  readonly right?: ICell;
  readonly bottom?: ICell;
};

/**
 * Props
 */
export type ICellProps = {
  style?: ICellPropsStyle;
  merge?: ICellPropsMerge;
};

export type ICellPropsStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type ICellPropsMerge = {
  rowspan?: number;
  colspan?: number;
};

export type ICellDiff = {
  left: t.IGridCell;
  right: t.IGridCell;
  isDifferent: boolean;
  list: Array<Diff<t.IGridCell>>;
};

/**
 * Events
 */
export type IGridCellChange = {
  cell: t.ICell;
  value: { from?: t.IGridCell; to?: t.IGridCell };
  isCancelled: boolean;
  isChanged: boolean;
  isModified: boolean;
  cancel(): void;
  modify(value: t.CellValue): void;
};
