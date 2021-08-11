import { Http, t, util, DEFAULT } from './common';
import { VercelTeam } from './VercelHttp.Team';

/**
 * A wrapper around the Vercel HTTP endpoints API.
 * See:
 *    https://vercel.com/docs/api#endpoints
 *
 *    SHA1 (digest) filehash checking example:
 *    https://vercel.com/docs/integrations#webhooks/securing-webhooks
 */
export function VercelHttp(args: { token: string; version?: number; http?: t.Http }): t.VercelHttp {
  const http = args.http ?? Http.create();
  const ctx = util.toCtx(args.token, args.version);
  const { token, version, headers } = ctx;

  const api: t.VercelHttp = {
    version: ctx.version,

    teams: {
      /**
       * Retrieve list of teams.
       * https://vercel.com/docs/api#endpoints/teams/list-all-your-teams
       */
      async list() {
        const url = ctx.url('teams');
        const res = await http.get(url, { headers });
        const { ok, status } = res;
        const json = res.json as any;
        const teams = !ok ? [] : (json.teams as t.VercelTeam[]);
        const error = ok ? undefined : (json.error as t.VercelHttpError);
        return { ok, status, teams, error };
      },
    },

    /**
     * Retrieve a single team.
     */
    team(id: string) {
      return VercelTeam({ http, token, version, teamId: id });
    },
  };

  return api;
}