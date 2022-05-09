import { t, rx } from '../common';
import { VercelFs } from '../Vercel.Fs';
import { VercelHttp } from '../Vercel.Http';
import { VercelInfo } from '../Vercel.Info';

type ApiToken = string;
type Name = string;
type Milliseconds = number;

type VercelDeployArgs = {
  http: t.Http;
  fs: t.Fs;
  token: ApiToken;
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
export const VercelDeploy = (args: VercelDeployArgs) => {
  const { fs, http, beforeUpload, token } = args;
  const { dispose, dispose$ } = rx.disposable(args.dispose$);
  const client = VercelHttp({ token, fs, http });

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
    client,
    team: args.team,
    project: args.project,

    /**
     * Derive info about the deployment.
     */
    async info() {
      const source = await VercelFs.readdir(fs);
      return VercelInfo.bundle({ fs, source });
    },

    /**
     * Read in the bundle manifest.
     */
    async manifest<T extends t.Manifest>(): Promise<T | undefined> {
      const path = fs.join('index.json');
      const exists = await fs.exists(path);
      return !exists ? undefined : await fs.json.read<T>(path);
    },

    /**
     * Write the deployment to the cloud.
     */
    async commit(config: t.VercelHttpDeployConfig = {}, options: { ensureProject?: boolean } = {}) {
      const info = await client.info();
      if (info.error) {
        console.log('status: ', info.status);
        console.log('error:  ', info.error);
        console.log('hint:    Possibly an expired API token.');
        console.log();
        throw new Error(info.error.message);
      }

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
