export type RuntimeEnv = {
  module: { name: string; version: string };
  bundle?: RuntimeEnvBundle;
};

export type RuntimeEnvBundle = {
  host: string;
  cell: string;
  dir?: string;
};
