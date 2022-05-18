import * as t from '../../common/types';

export type ModuleInfoFields =
  | 'Module'
  | 'Module.Name'
  | 'Module.Version'
  | 'Token.API'
  | 'Token.API.Hidden'
  | 'Deployment.Response';

export type ModuleInfoData = {
  token?: string;
  deploymentResponse?: t.VercelHttpDeployResponse;
};
