export type TypeFileManifest = {
  hash: string;
  files: TypeFile[];
};

export type TypeFile = {
  filename: string;
  bytes: number;
  filehash: string;
};
