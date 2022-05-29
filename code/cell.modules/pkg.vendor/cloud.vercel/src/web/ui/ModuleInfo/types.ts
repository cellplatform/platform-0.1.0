import * as t from '../../common/types';

export type ModuleInfoFields =
  | 'Module'
  | 'Module.Name'
  | 'Module.Version'
  | 'Token.API'
  | 'Token.API.Hidden'
  | 'Deploy.Domain'
  | 'Deploy.Response';

export type ModuleInfoData = {
  token?: string;
  deployment?: {
    response?: t.VercelHttpDeployResponse;
    domain?: string; // DNS alias.
  };
};
