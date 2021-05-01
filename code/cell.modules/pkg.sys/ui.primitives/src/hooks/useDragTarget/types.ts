export type DroppedFile = { filename: string; data: ArrayBuffer; mimetype: string };

export type Dropped = {
  dir: string;
  files: DroppedFile[];
  urls: string[];
};
