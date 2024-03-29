import { VercelDeploy as VercelDeployWeb } from '../../web/Vercel/Vercel.Deploy';
import { t } from './common';
import { VercelNode } from './Vercel.Node';

type ApiToken = string;
type Name = string;
type DirPath = string;
type Milliseconds = number;

type Args = {
  token: ApiToken;
  dir: DirPath;
  team: Name;
  project: Name;
  timeout?: Milliseconds;
  name?: Name; // Deployment name (when not derivable from manifest).
  beforeUpload?: t.VercelHttpBeforeFileUpload;
};

/**
 * A deployment to "Vercel"
 * Upstream cloud provider: - AWS Lambdas
 *                          - Geo-cached.
 */
export const VercelDeploy = (args: Args) => {
  const { token, team, project, timeout, beforeUpload, name } = args;
  const { fs, dispose$, http } = VercelNode(args);
  return VercelDeployWeb({
    token,
    fs,
    http,
    team,
    project,
    name,
    timeout,
    beforeUpload,
    dispose$,
  });
};
