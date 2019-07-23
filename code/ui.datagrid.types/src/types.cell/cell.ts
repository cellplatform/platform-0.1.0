import { t } from '../common';

export type ICell = {
  /**
   * [Properties]
   */
  readonly row: number;
  readonly column: number;
  readonly key: string;
  readonly size: t.ISize;
  readonly width: number;
  readonly height: number;
  readonly siblings: ICellSiblings;
  value: t.CellValue;

  /**
   * [Methods]
   */
  toString(): string;
};

export type ICellSiblings = {
  readonly left?: ICell;
  readonly top?: ICell;
  readonly right?: ICell;
  readonly bottom?: ICell;
};
