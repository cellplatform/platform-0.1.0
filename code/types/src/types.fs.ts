export type IFs = {
  is: IFsIs;

  // Filesystem.
  exists(path: string): Promise<boolean>;
  ensureDir(path: string, options?: IFsEnsureOptions | number): Promise<void>;
  writeFile(path: string, data: any, options?: IFsWriteFileOptions | string): Promise<void>;
  readFile(path: string, options?: IFsReadFileOptions): Promise<Uint8Array>;
  remove(path: string): Promise<void>;

  // Path.
  join(...pathSegments: string[]): string;
  resolve(...pathSegments: string[]): string;
  dirname(path: string): string;
  basename(path: string): string;
  extname(path: string): string;
};

export type IFsEnsureOptions = { mode?: number };
export type IFsWriteFileOptions = { encoding?: string; flag?: string; mode?: number };
export type IFsReadFileOptions = { flag?: string } | { encoding: string; flag?: string };

export type IFsIs = {
  dir(path: string): Promise<boolean>;
  file(path: string): Promise<boolean>;
};
