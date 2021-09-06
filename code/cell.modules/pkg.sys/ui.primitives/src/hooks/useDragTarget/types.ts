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
