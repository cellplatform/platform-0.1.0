export type GlobalCellEnv = {
  bundle?: GlobalCellEnvBundle;
};

export type GlobalCellEnvBundle = {
  host: string;
  cell: string;
  dir?: string;
};

declare global {
  const __CELL_ENV__: GlobalCellEnv;
}
