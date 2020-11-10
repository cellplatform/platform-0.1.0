export type GlobalCellEnv = {
  module: { name: string; version: string };
  bundle?: GlobalCellEnvBundle;
};

export type GlobalCellEnvBundle = {
  host: string;
  cell: string;
  dir?: string;
};

declare global {
  const __CELL_ENV__: GlobalCellEnv;
  const __webpack_share_scopes__: any;
  const __webpack_init_sharing__: any;
}
