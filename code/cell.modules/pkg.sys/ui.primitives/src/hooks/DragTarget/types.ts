import { RefObject } from 'react';

export type Dropped = {
  dir: string;
  files: DroppedFile[];
  urls: string[];
};

export type DroppedFile = {
  path: string;
  data: Uint8Array;
  mimetype: string;
};

export type DragTargetHook<T extends HTMLElement> = {
  ref: RefObject<T>;
  isDragOver: boolean;
  isDropped: boolean;
  isEnabled: boolean;
  dropped?: Dropped;
  reset(): void;
};
