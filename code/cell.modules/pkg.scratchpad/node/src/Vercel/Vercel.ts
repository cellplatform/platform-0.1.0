import { http } from '@platform/http';
import * as t from './types';
import * as util from './util';
import { VercelTeam } from './VercelTeam';

type Q = Record<string, string | number>;

/**
 * A wrapper around the Vercel HTTP endpoints API.
 * See:
 *    https://vercel.com/docs/api#endpoints
 */
export function Vercel(args: { token: string; version?: number }): t.VercelHttp {
  const { version = 12, token = '' } = args;

  if (!token) throw new Error(`A Vercel authorization token not provided.`);
  const Authorization = `Bearer ${token}`;
  const headers = { Authorization };

  const toUrl = (path: string, query?: Q) => util.toUrl(version, path, query);

  const api: t.VercelHttp = {
    teams: {
      /**
       * Retrieve list of teams.
       * https://vercel.com/docs/api#endpoints/teams/list-all-your-teams
       */
      async list() {
        const url = toUrl('teams');
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
