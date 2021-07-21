import { http } from '@platform/http';
import * as t from './types';
import * as util from './util';
import { fs } from '../common';

/**
 * Create a new deployment.
 * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
 */
export async function deploy(
  args: t.VercelDeployArgs & { token: string; version: number; teamId: string; projectId: string },
): Promise<t.VercelDeployResponse> {
  const ctx = util.toCtx(args.token, args.version);
  const { dir, teamId } = args;
  const { headers } = ctx;

  if (!(await fs.is.dir(dir))) throw new Error(`The source 'dir' is not a directory. ${dir}`);

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

  const url = ctx.url('deployments', { teamId });
  const res = await http.post(url, body, { headers });

  const { ok, status } = res;
  const json = res.json as any;
  const error = ok ? undefined : (res.json as t.VercelHttpError);
  const urls = {
    inspect: util.ensureHttps(json.inspectorUrl),
    public: util.ensureHttps(json.url),
  };

  return { ok, status, paths, urls, error };
}
