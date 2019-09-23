import { t } from '../../common';

/**
 * Retrieve data for calculating refs.
 */
export type IRefContext = {
  getCell: (key: string) => Promise<t.IGridCell>;
};

/**
 * Cell References
 */
export type ICellRefs = {
  out: IRefOut[];
};

export type IRefOut = {
  // source: 'REF' | 'FUNC' | 'RANGE';
  target: RefTarget;
  path: string;
  param?: number;
  error?: RefError;
};

export type RefTarget = 'VALUE' | 'FUNC' | 'RANGE';
export type RefError = 'CIRCULAR';
