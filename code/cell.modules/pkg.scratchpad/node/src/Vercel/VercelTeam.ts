import { http } from '@platform/http';

import * as t from './types';
import * as util from './util';
import { VercelTeamProject } from './VercelTeamProject';

export function VercelTeam(args: {
  token: string;
  version: number;
  teamId: string;
}): t.VercelHttpTeam {
  const ctx = util.toCtx(args.token, args.version);
  const { teamId } = args;
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
      const team = (!ok ? {} : res.json) as t.VercelTeam;
      const error = ok ? undefined : (res.json as t.VercelHttpError);
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
      const projects = !ok ? [] : ((res.json as any).projects as t.VercelProject[]);
      const error = ok ? undefined : (res.json as t.VercelHttpError);
      return { ok, status, projects, error };
    },

    /**
     * Work on a single project within the team.
     */
    project(name) {
      return VercelTeamProject({ token, version, name, team: api });
    },
  };

  return api;
}
