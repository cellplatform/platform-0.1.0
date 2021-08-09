import { util, t } from './common';
import { deploy } from './deploy';

export function VercelTeamProject(args: {
  http: t.Http;
  token: string;
  version?: number;
  name: string;
  team: t.VercelHttpTeam;
}): t.VercelHttpTeamProject {
  const ctx = util.toCtx(args.token, args.version);
  const { http, team } = args;
  const { headers, version, token } = ctx;

  const name = (args.name ?? '').trim();
  const teamId = team.id;

  if (!name) throw new Error(`Project name not specified`);

  const api: t.VercelHttpTeamProject = {
    name,
    team,

    /**
     * Determine if the project exists.
     */
    async exists() {
      const res = await api.info();
      return res.status.toString().startsWith('2');
    },

    /**
     * Retrieve project information.
     * https://vercel.com/docs/api#endpoints/projects/get-a-single-project
     */
    async info() {
      const url = ctx.url(`projects/${name}`, { teamId });
      const res = await http.get(url, { headers });
      const { ok, status } = res;
      const json = res.json as any;
      const project = (!ok ? {} : json) as t.VercelProject;
      const error = ok ? undefined : (json.error as t.VercelHttpError);
      return { ok, status, project, error };
    },

    /**
     * Create a new project.
     * https://vercel.com/docs/api#endpoints/projects/create-a-project
     */
    async create(options = {}) {
      const url = ctx.url('projects', { teamId });
      const body = { name, gitRepository: options.git };

      const res = await http.post(url, body, { headers });
      const { ok, status } = res;
      const json = res.json as any;

      const project = (ok ? json : {}) as t.VercelProject;
      const error = ok ? undefined : (json.error as t.VercelHttpError);

      return { ok, status, project, error };
    },

    /**
     * Create a new deployment.
     * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
     */
    async deploy(args) {
      if (!(await api.exists())) await api.create();

      const projectInfo = await api.info();
      if (projectInfo.error) {
        const error = projectInfo.error;
        const code = error.code ?? '';
        const message = error.message ?? '';
        throw new Error(`Failed to deploy while retrieving project details. [${code}] ${message}`);
      }

      const teamInfo = await team.info();
      if (teamInfo.error) {
        const error = teamInfo.error;
        const code = error.code ?? '';
        const message = error.message ?? '';
        throw new Error(`Failed to deploy while retrieving team details. [${code}] ${message}`);
      }

      return deploy({
        ...args,
        http,
        token,
        version,
        team: { id: teamId, name: teamInfo.team?.name ?? '' },
        project: { id: projectInfo.project.id, name },
      });
    },
  };

  return api;
}
