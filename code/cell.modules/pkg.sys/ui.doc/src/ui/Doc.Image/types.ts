type AspectRatio = string;
type Size = { width: number; height: number; ratio: AspectRatio };

/**
 * Fires when an image has completed it's load sequence (with or without an error).
 */
export type DocImageReadyHandler = (e: DocImageReadyHandlerArgs) => void;
export type DocImageReadyHandlerArgs = {
  url: string;
  size: DocImageSize;
  error?: string;
};

/**
 * Size of an image
 */
export type DocImageSize = {
  rendered: Size;
  natural: Size;
};
