import * as t from '../../common/types';

export type DocLayoutSizes = {
  root: t.DomRect;
  column: { width: number; height: number };
};

export type DocResizeHandler = (e: DocResizeHandlerArgs) => void;
export type DocResizeHandlerArgs = {
  is: t.MinSizeFlags;
  sizes: DocLayoutSizes;
};
