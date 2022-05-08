import { t, rx } from '../common';
import { VercelFs } from '../Vercel.Fs';
import { VercelHttp } from '../Vercel.Http';

type ApiToken = string;
type DirectoryPath = string;
type Name = string;
type Milliseconds = number;

type Args = {
  http: t.Http;
  fs: t.Fs;
  token: ApiToken;
  dir: DirectoryPath; // TEMP 🐷 remove
  team: Name;
  project: Name;
  timeout?: Milliseconds;
  beforeUpload?: t.VercelHttpBeforeFileUpload;
  dispose$?: t.Observable<any>;
};

/**
 * A deployment to "Vercel"
 * Upstream cloud provider: - AWS Lambdas
 *                          - Geo-cached.
 */
export const VercelDeploy = (args: Args) => {
  const { fs, http, beforeUpload, token, dir } = args;
  const { dispose, dispose$ } = rx.disposable(args.dispose$);
  // const { client, dir, fs, dispose, dispose$ } = VercelNode(args);

  const client = VercelHttp({ token, fs, http });

  // client.

  // const { dispoe } = client;

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
     * Derive info about the deployment.
     */
    async info() {
      const source = await VercelFs.readdir(fs);
      return VercelFs.info({ fs, source });
    },

    /**
     * Read in the bundle manifest.
     */
    async manifest<T extends t.Manifest>(): Promise<T | undefined> {
      // const manifest = await fs.manifest<T>()
      // const path = nodefs.join(dir, 'index.json');
      // const exists = await nodefs.pathExists(path);
      // return !exists ? undefined : ((await nodefs.readJson(path)) as T);

      /**
       * TODO 🐷
       */

      return undefined;
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
