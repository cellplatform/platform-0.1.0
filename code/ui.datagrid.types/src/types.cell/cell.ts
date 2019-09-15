import { t } from '../common';

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
};

export type ICellSiblings = {
  readonly left?: ICell;
  readonly top?: ICell;
  readonly right?: ICell;
  readonly bottom?: ICell;
};

/**
 * [Props]
 */
export type ICellProps = {
  style?: ICellStyleProps;
};

export type ICellStyleProps = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};
