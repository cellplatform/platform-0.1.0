import { http } from '@platform/http';
import { fs, time, util, t, asArray } from '../common';

/**
 * Create a new deployment.
 * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
 */
export async function deploy(
  args: t.VercelDeployArgs & {
    token: string;
    version: number;
    team: { id: string; name: string };
    project: { id: string; name: string };
  },
): Promise<t.VercelDeployResponse> {
  const ctx = util.toCtx(args.token, args.version);
  const { dir, team, project } = args;
  const { headers } = ctx;

  if (!(await fs.is.dir(dir))) throw new Error(`The source 'dir' is not a directory. ${dir}`);

  /**
   * Read in files to upload and ["base64"]
   * encode them for transport over HTTP.
   */
  const toFile = async (dir: string, file: string) => {
    const buffer = await fs.readFile(fs.join(dir, file));
    const encoding = 'base64';
    const data = buffer.toString(encoding);
    return { file, data, encoding };
  };

  const paths = (await fs.glob.find(`${dir}/**/*`)).map((p) => p.substring(dir.length + 1));
  const files = await Promise.all(paths.map((file) => toFile(dir, file)));

  /**
   * Append the deployments {meta} data object with
   * the manifest {module} details.
   */
  const readManifest = async () => {
    const path = fs.join(dir, 'index.json');
    if (!(await fs.pathExists(path))) return;
    const manifest = (await fs.readJson(path)) as t.ModuleManifest;
    return typeof manifest === 'object' && manifest.kind === 'module' ? manifest : undefined;
  };

  const manifest = await readManifest();

  const meta: t.VercelDeployMeta = manifest
    ? {
        ...manifest.module,
        kind: 'bundle:code/module',
        modulehash: manifest.hash.module,
        fileshash: manifest.hash.files,
        bytes: manifest.files.reduce((acc, next) => acc + next.bytes, 0).toString(),
      }
    : {
        kind: 'bundle:plain/files',
        bytes: (await fs.size.dir(dir)).bytes.toString(),
      };

  const deriveName = () => {
    if (manifest) return `${manifest.module.namespace}-v${manifest.module.version}`;
    return 'unnamed';
  };

  const name = args.name ? args.name : deriveName();

  /**
   * HTTP BODY
   * Request Parameters:
   *    https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment/request-parameters
   */
  const body = {
    name,
    project: project.id,
    meta,
    env: args.env,
    'build.env': args.buildEnv,
    functions: args.functions,
    routes: args.routes,
    regions: args.regions,
    public: args.public,
    target: args.target,
    alias: asArray(args.alias).filter(Boolean),
    files,
  };

  const url = ctx.url('deployments', { teamId: team.id });
  const res = await http.post(url, body, { headers });
  const json = (res.json ?? {}) as any;

  console.log('json', json);

  /**
   * Response
   */
  const { ok, status } = res;
  const error = ok ? undefined : (json as t.VercelHttpError);
  const deployment = {
    id: json.id ?? '',
    team: team.name,
    project: project.name,
    regions: json.regions ?? [],
  };
  const urls = {
    inspect: util.ensureHttps(json.inspectorUrl),
    public: util.ensureHttps(json.url),
  };

  return {
    ok,
    status,
    deployment,
    paths,
    meta,
    urls,
    error,
  };
}
