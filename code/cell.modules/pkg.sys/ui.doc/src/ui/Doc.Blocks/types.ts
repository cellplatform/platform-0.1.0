export type DocBlocksClickHandler = (e: DocBlocksClickHandlerArgs) => void;
export type DocBlocksClickHandlerArgs = { index: number };

export type DocBlocksPadding = {
  header?: boolean | number;
  footer?: boolean | number;
};

export type DocBlocksSpacing = { y?: number };
