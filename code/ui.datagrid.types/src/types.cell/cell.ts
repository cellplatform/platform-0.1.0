import { t } from '../common';

export type ICell = {
  /**
   * [Properties]
   */
  readonly row: number;
  readonly column: number;
  readonly key: string;
  readonly td: HTMLTableCellElement;
  readonly size: t.ISize;
  readonly width: number;
  readonly height: number;
  readonly sibling: ICellSiblings;
  value: t.CellValue;

  /**
   * [Methods]
   */
  toString(): string;
  isPosition(args: { row: number; column: number }): boolean;
};

export type ICellSiblings = {
  readonly left?: ICell;
  readonly top?: ICell;
  readonly right?: ICell;
  readonly bottom?: ICell;
};
