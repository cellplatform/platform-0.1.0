import { t, util } from './common';
import { VercelTeamProject } from './VercelHttp.Team.Project';
import { VercelTeamDeployment } from './VercelHttp.Team.Deployment';

export function VercelTeam(args: {
  http: t.Http;
  token: string;
  version?: number;
  teamId: string;
}): t.VercelHttpTeam {
  const ctx = util.toCtx(args.token, args.version);
  const { http, teamId } = args;
  const { headers, token, version } = ctx;

  const api: t.VercelHttpTeam = {
    id: teamId,

    /**
     * Retrieve team information.
     * https://vercel.com/docs/api#endpoints/teams/get-single-team-information
     */
    async info() {
      const url = ctx.url(`teams/${teamId}`);
      const res = await http.get(url, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const team = (!ok ? {} : json) as t.VercelTeam;
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      return { ok, status, team, error };
    },

    /**
     * List projects.
     * https://vercel.com/docs/api#endpoints/projects
     */
    async projects(options = {}) {
      const url = ctx.url('projects', { ...options, teamId });
      const res = await http.get(url, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const projects = !ok ? [] : (json.projects as t.VercelProject[]);
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      return { ok, status, projects, error };
    },

    /**
     * Work on a single project within the team.
     */
    project(name) {
      return VercelTeamProject({ http, token, version, name, team: api });
    },

    /**
     * List deployments.
     * https://vercel.com/docs/api#endpoints/deployments/list-deployments
     */
    async deployments(options = {}) {
      /**
       * TODO 🐷
       * - options passed into URL query builder.
       */

      const url = ctx.url('now/deployments', { teamId }, { version: 5 });

      const res = await http.get(url, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const deployments = !ok ? [] : (json.deployments as t.VercelListDeployment[]);
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      return { ok, status, deployments, error };
    },

    /**
     * Work on a single deployment within a team.
     */
    deployment(url) {
      return VercelTeamDeployment({ http, token, version, url, team: api });
    },
  };

  return api;
}
