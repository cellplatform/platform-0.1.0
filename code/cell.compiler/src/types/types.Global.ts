export type GlobalCellEnv = {
  module: { name: string; version: string };
  bundle?: GlobalCellEnvBundle;
};

export type GlobalCellEnvBundle = {
  host: string;
  cell: string;
  dir?: string;
};
