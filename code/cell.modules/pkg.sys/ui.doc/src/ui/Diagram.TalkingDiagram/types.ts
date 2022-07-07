type Pixels = number;
type Size = { width: Pixels; height: Pixels };

export type DiagramLayoutSize = {
  root: Size;
};

export type DiagramResizeHandler = (e: DiagramResizeHandlerArgs) => void;
export type DiagramResizeHandlerArgs = { size: DiagramLayoutSize };
