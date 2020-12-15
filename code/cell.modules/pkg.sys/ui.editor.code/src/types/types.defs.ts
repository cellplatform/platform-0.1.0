export type TypeFileManifest = {
  hash: string;
  files: TypeFile[];
};

export type TypeFile = {
  path: string;
  bytes: number;
  filehash: string;
};
