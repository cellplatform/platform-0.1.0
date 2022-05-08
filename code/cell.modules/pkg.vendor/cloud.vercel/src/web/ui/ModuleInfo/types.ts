export type ModuleInfoFields =
  | 'Module'
  | 'Module.Name'
  | 'Module.Version'
  | 'Token.API'
  | 'Token.API.Hidden';

export type ModuleInfoConfig = {
  token?: string;
};
