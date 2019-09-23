import { t } from '../../common';

/**
 * Retrieve data for calculating refs.
 */
export type IRefContext = {
  getCell: (key: string) => Promise<t.IGridCell | undefined>;
};

/**
 * References
 */
export type RefTarget = 'VALUE' | 'FUNC' | 'RANGE' | 'UNKNOWN';

export type ICellRefs = {
  out: IRefOut[];
};

export type IRefOut = {
  // source: 'REF' | 'FUNC' | 'RANGE';
  target: RefTarget;
  path: string;
  param?: number;
  error?: IRefError;
};

/**
 * Error
 */
export type RefError = 'CIRCULAR' | 'NAME';
export type IRefError = {
  type: RefError;
  message: string;
};
