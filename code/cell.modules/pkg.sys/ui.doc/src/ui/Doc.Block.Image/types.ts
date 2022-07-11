type Size = { width: number; height: number };

/**
 * Fires when an image has completed it's load sequence (with or without an error).
 */
export type DocImageBlockReadyHandler = (e: DocImageBlockReadyHandlerArgs) => void;
export type DocImageBlockReadyHandlerArgs = {
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