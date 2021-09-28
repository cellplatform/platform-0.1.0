import { t, nodefs, rx, Filesystem } from './common';
import { VercelHttp } from '../node.VercelHttp';
import { VercelFs } from './Vercel.Fs';
import { VercelNode } from './Vercel.Node';

type ApiToken = string;
type DirectoryPath = string;
type Name = string;

type Args = {
  token: ApiToken;
  dir: DirectoryPath;
  team: Name;
  project: Name;
  beforeUpload?: t.VercelHttpBeforeFileUpload;
};

/**
 * A deployment to "Vercel"
 * Upstream cloud provider: AWS Lambdas
 *                          Geo-cached.
 */
export const VercelDeploy = (args: Args) => {
  const { beforeUpload } = args;
  const { client, dir, fs, dispose, dispose$ } = VercelNode(args);

  const getTeam = async (name: string) => {
    const teams = (await client.teams.list()).teams;
    const team = teams.find((team) => team.name === name);
    if (!team) throw new Error(`Cannot find team named '${name}'`);
    return client.team(team.id);
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
    async commit(config: t.VercelHttpDeployConfig = {}) {
      const team = await getTeam(args.team);
      const project = team.project(args.project);
      const source = await VercelFs.readdir(fs);
      const res = await project.deploy({ ...config, source, beforeUpload });
      return res;
    },
  };
};
