export type WebpackAsset = { filename: string; bytes: number; size: string };
export type WebpackError = { message: string; details: string; file?: string };

export type WebpackStats = {
  ok: boolean;
  elapsed: number;
  log(): void;
  assets: {
    list: WebpackAsset[];
    sortBySize(): WebpackAsset[];
    sortByName(): WebpackAsset[];
    log(): void;
  };
  errors: {
    list: WebpackError[];
    log(): void;
  };
};
