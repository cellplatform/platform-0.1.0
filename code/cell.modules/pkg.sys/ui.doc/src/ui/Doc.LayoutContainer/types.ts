import * as t from '../../common/types';

type Size = { width: number; height: number };

export type DocLayoutSizes = {
  root: Size;
  column: Size;
};

export type DocResizeHandler = (e: DocResizeHandlerArgs) => void;
export type DocResizeHandlerArgs = {
  is: t.MinSizeFlags;
  sizes: DocLayoutSizes;
};
