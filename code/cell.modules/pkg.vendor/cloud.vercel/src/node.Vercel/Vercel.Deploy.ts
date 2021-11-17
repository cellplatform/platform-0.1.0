import { nodefs, t } from './common';
import { VercelFs } from './Vercel.Fs';
import { VercelNode } from './Vercel.Node';

type ApiToken = string;
type DirectoryPath = string;
type Name = string;
type Milliseconds = number;

type Args = {
  token: ApiToken;
  dir: DirectoryPath;
  team: Name;
  project: Name;
  beforeUpload?: t.VercelHttpBeforeFileUpload;
  timeout?: Milliseconds;
};

/**
 * A deployment to "Vercel"
 * Upstream cloud provider: - AWS Lambdas
 *                          - Geo-cached.
 */
export const VercelDeploy = (args: Args) => {
  const { beforeUpload } = args;
  const { client, dir, fs, dispose, dispose$ } = VercelNode(args);

  const getTeam = async (teamName: string) => {
    const team = await client.teams.byName(teamName);
    if (!team) throw new Error(`Cannot find team named '${teamName}'`);
    return team;
  };

  const ensureProject = async (projectName: string) => {
    const team = await getTeam(args.team);
    const project = team.project(projectName);
    const existing = await project.exists();

    let error: t.VercelHttpError | undefined;
    if (!existing) {
      const res = await project.create();
      error = res.error;
    }

    const ok = !error;
    return {
      ok,
      created: ok && !existing,
      project,
      error,
    };
  };

  return {
    dispose,
    dispose$,
    dir,
    client,
    team: args.team,
    project: args.project,

    /**
     * Read in the bundle manifest.
     */
    async manifest<T extends t.Manifest>(): Promise<T | undefined> {
      const path = nodefs.join(dir, 'index.json');
      const exists = await nodefs.pathExists(path);
      return !exists ? undefined : ((await nodefs.readJson(path)) as T);
    },

    /**
     * Write the deployment to the cloud.
     */
    async commit(config: t.VercelHttpDeployConfig = {}, options: { ensureProject?: boolean } = {}) {
      const team = await getTeam(args.team);
      const project = team.project(args.project);

      if (options.ensureProject) {
        await ensureProject(args.project);
      } else {
        const exists = await project.exists();
        if (!exists) throw new Error(`Project '${args.project}' does not exist.`);
      }

      const source = await VercelFs.readdir(fs);
      const res = await project.deploy({ ...config, source, beforeUpload });
      return res;
    },

    /**
     * Ensure the project exists.
     */
    ensureProject,
  };
};
