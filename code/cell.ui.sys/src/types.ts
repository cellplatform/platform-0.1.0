export type IEnv = {
  def: IDef;
  host: string;
};

export type IDef = {
  uri: string;
};

export type GetEnv = (callback: GetEnvCallback) => void;
export type GetEnvCallback = (env: IEnv) => void;
export type ITopWindow = { getEnv: GetEnv };
