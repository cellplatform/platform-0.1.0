export type WebpackShared = { singleton: boolean; requiredVersion: string };
export type WebpackAsset = { filename: string; bytes: number; size: string };
export type WebpackError = { message: string; details: string; file?: string };

export type WebpackStats = {
  ok: boolean;
  elapsed: number;
  output: { path: string; publicPath: string };
  assets: {
    list: WebpackAsset[];
    bytes: number;
    sortBySize(): WebpackAsset[];
    sortByName(): WebpackAsset[];
  };
  errors: WebpackError[];
};
