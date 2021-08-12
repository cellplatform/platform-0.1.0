import { util, t } from './common';
import { VercelDeploymentFiles } from './VercelHttp.Files.Deployment';

type Url = string;

export function VercelTeamDeployment(args: {
  http: t.Http;
  fs: t.IFs;
  token: string;
  version?: number;
  url: Url; // "<id>.vercel.app" or alias url.
  team: t.VercelHttpTeam;
}): t.VercelHttpTeamDeployment {
  const ctx = util.toCtx(args.fs, args.token, args.version);
  const { http, team } = args;
  const teamId = team.id;
  const { headers, version, token, fs } = ctx;

  const api: t.VercelHttpTeamDeployment = {
    url: (args.url ?? '').trim().replace(/^https\:\/\//, ''),
    team,

    /**
     * Determine if the project exists.
     */
    async exists() {
      const res = await api.info();
      return res.status.toString().startsWith('2');
    },

    /**
     * Retrieve team information.
     * https://vercel.com/docs/api#endpoints/deployments/get-a-single-deployment
     */
    async info() {
      const url = ctx.url(`now/deployments/get`, { url: api.url, teamId });
      const res = await http.get(url, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const deployment = (!ok ? {} : json) as t.VercelDeployment;
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      return { ok, status, deployment, error };
    },

    /**
     * List deployment files.
     * https://vercel.com/docs/api#endpoints/deployments/list-deployment-files
     */
    async files() {
      const info = await api.info();
      const deploymentId = info.deployment?.id;

      const url = ctx.url(`now/deployments/${deploymentId}/files`, { teamId });
      const res = await http.get(url, { headers });
      const { ok, status } = res;
      const json = res.json as any;

      const files = (
        !ok
          ? {}
          : VercelDeploymentFiles({
              fs,
              http,
              token,
              version,
              teamId,
              deploymentId,
              url: info.deployment.url || '',
              list: json as t.VercelDeploymentFile[],
            })
      ) as t.VercelHttpDeploymentFiles;

      const error = ok ? undefined : (json.error as t.VercelHttpError);
      return { ok, status, files, error };
    },
  };

  return api;
}
