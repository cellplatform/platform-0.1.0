import * as t from '../../common/types';

export type ModuleInfoFields =
  | 'Module'
  | 'Module.Name'
  | 'Module.Version'
  | 'Token.API'
  | 'Token.API.Hidden'
  | 'Deploy.Team'
  | 'Deploy.Project'
  | 'Deploy.Domain'
  | 'Deploy.Response';

export type ModuleInfoData = {
  token?: string;
  deploy?: {
    team?: string;
    project?: string;
    domain?: string; // DNS alias.
    response?: t.VercelHttpDeployResponse;
  };
};
