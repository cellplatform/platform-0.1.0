import * as t from '../../common/types';

type Size = { width: number; height: number };

export type DocLayoutContainerDebug = {
  bg?: boolean;
  tracelines?: boolean;
  renderCount?: boolean;
  columnSize?: boolean;
};

export type DocLayoutSizes = {
  root: Size;
  column: Size;
};

export type CalculateDocLayoutSizes = (root: Size) => DocLayoutSizes;

/**
 * Handler: Document resize.
 */
export type DocResizeHandler = (e: DocResizeHandlerArgs) => void;
export type DocResizeHandlerArgs = {
  is: t.MinSizeFlags;
  sizes: DocLayoutSizes;
};
