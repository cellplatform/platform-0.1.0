import { http } from '@platform/http';
import * as t from './types';
import * as util from './util';
import { fs } from '../common';

type Q = Record<string, string | number>;

export function VercelTeam(args: {
  token: string;
  version: number;
  teamId: string;
}): t.VercelHttpTeam {
  const { teamId, version } = args;

  const Authorization = `Bearer ${args.token}`;
  const headers = { Authorization };

  const toUrl = (path: string, query?: Q) => util.toUrl(version, path, query);

  const api: t.VercelHttpTeam = {
    id: teamId,

    /**
     * Retrieve team information.
     * https://vercel.com/docs/api#endpoints/teams/get-single-team-information
     */
    async info() {
      const url = toUrl(`teams/${teamId}`);
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
      const url = toUrl('projects', { ...options, teamId });
      const res = await http.get(url, { headers });

      const { ok, status } = res;
      const projects = !ok ? [] : ((res.json as any).projects as t.VercelProject[]);
      const error = ok ? undefined : (res.json as t.VercelHttpError);
      return { ok, status, projects, error };
    },

    /**
     * Create a new deployment.
     * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
     */
    async deploy(args) {
      const { sourceDir: dir } = args;
      if (!(await fs.is.dir(dir))) throw new Error(`The 'sourceDir' is not a directory. ${dir}`);

      const toFile = async (dir: string, file: string) => {
        const buffer = await fs.readFile(fs.join(dir, file));
        const encoding = 'base64';
        const data = buffer.toString(encoding);
        return { file, data, encoding };
      };

      const paths = (await fs.glob.find(`${dir}/**/*`)).map((p) => p.substring(dir.length + 1));
      const files = await Promise.all(paths.map((file) => toFile(dir, file)));

      const body = {
        name: args.name,
        project: args.projectId,
        meta: args.meta,
        env: args.env,
        'build.env': args.buildEnv,
        functions: args.functions,
        routes: args.routes,
        regions: args.regions,
        public: args.public,
        target: args.target,
        alias: args.alias,
        files,
      };

      const url = toUrl('deployments', { teamId });
      const res = await http.post(url, body, { headers });

      const { ok, status } = res;
      const json = res.json as any;
      const error = ok ? undefined : (res.json as t.VercelHttpError);
      const urls = {
        inspect: util.ensureHttps(json.inspectorUrl),
        public: util.ensureHttps(json.url),
      };

      return { ok, status, paths, urls, error };
    },
  };

  return api;
}
