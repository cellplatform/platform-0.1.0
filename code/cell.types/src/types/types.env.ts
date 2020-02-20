export type IEnvLoaderQuery = { host: string; def: string };

export type IEnv = { host: string; def: IDef };
export type IDef = { uri: string };

export type GetEnv = (callback: GetEnvCallback) => void;
export type GetEnvCallback = (env: IEnv) => void;
export type ITopWindow = { getEnv: GetEnv };
