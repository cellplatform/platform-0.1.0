export type WebpackAsset = { filename: string; bytes: number; size: string };
export type WebpackError = { message: string; details: string; file?: string };

export type WebpackStats = {
  ok: boolean;
  elapsed: number;
  log(): void;
  output: { path: string; publicPath: string };
  assets: {
    list: WebpackAsset[];
    bytes: number;
    sortBySize(): WebpackAsset[];
    sortByName(): WebpackAsset[];
    log(options?: { indent?: number }): void;
  };
  errors: {
    list: WebpackError[];
    log(): void;
  };
};
