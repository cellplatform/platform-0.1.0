import { http, t, util } from './common';
import { VercelTeam } from './Vercel.Team';

/**
 * A wrapper around the Vercel HTTP endpoints API.
 * See:
 *    https://vercel.com/docs/api#endpoints
 */
export function Vercel(args: { token: string; version?: number }): t.VercelHttp {
  const ctx = util.toCtx(args.token, args.version ?? 12);
  const { token, version, headers } = ctx;

  const api: t.VercelHttp = {
    teams: {
      /**
       * Retrieve list of teams.
       * https://vercel.com/docs/api#endpoints/teams/list-all-your-teams
       */
      async list() {
        const url = ctx.url('teams');
        const res = await http.get(url, { headers });
        const { ok, status } = res;
        const teams = !ok ? [] : ((res.json as any).teams as t.VercelTeam[]);
        const error = ok ? undefined : (res.json as t.VercelHttpError);
        return { ok, status, teams, error };
      },
    },

    /**
     * Retrieve a single team.
     */
    team(id: string) {
      return VercelTeam({ token, version, teamId: id });
    },
  };

  return api;
}
