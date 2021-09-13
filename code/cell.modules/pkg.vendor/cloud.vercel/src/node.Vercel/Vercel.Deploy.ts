import { t, nodefs, rx, Filesystem } from './common';
import { VercelHttp } from '../node.VercelHttp';
import { VercelFs } from './Vercel.Fs';

type ApiToken = string;
type DirectoryPath = string;
type Name = string;

type Args = {
  token: ApiToken;
  dir: DirectoryPath;
  team: Name;
  project: Name;
};

/**
 * A deployment to "Vercel"
 * Upstream cloud provider: AWS Lambdas
 *                          Geo-cached.
 */
export const VercelDeploy = (args: Args) => {
  const { token } = args;

  const dir = nodefs.resolve(args.dir ?? '');
  const bus = rx.bus();
  const store = Filesystem.Controller({ bus, fs: dir });
  const fs = store.fs({ timeout: 9999 });
  const client = VercelHttp({ fs, token });

  const getTeam = async (name: string) => {
    const teams = (await client.teams.list()).teams;
    const team = teams.find((team) => team.name === name);
    if (!team) throw new Error(`Cannot find team named '${name}'`);
    return client.team(team.id);
  };

  return {
    dir,
    client,
    team: args.team,
    project: args.project,

    /**
     * Run the deployment.
     */
    async push(config: t.VercelHttpDeployConfig = {}) {
      const team = await getTeam(args.team);
      const project = team.project(args.project);
      const source = await VercelFs.readdir(fs);
      const res = await project.deploy({ ...config, source });
      return res;
    },
  };
};
