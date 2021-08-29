import { asArray, t, util } from './common';
import { VercelUploadFiles } from './VercelHttp.Files.Upload';

/**
 * Create a new deployment.
 * https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment
 */
export async function deploy(
  args: t.VercelHttpDeployArgs & {
    ctx: t.Ctx;
    team: { id: string; name: string };
    project: { id: string; name: string };
  },
): Promise<t.VercelHttpDeployResponse> {
  const { ctx, dir, team, project } = args;
  const { http, fs, headers } = ctx;
  const teamId = team.id;

  if (!(await fs.is.dir(dir))) {
    throw new Error(`The source is not a directory. ${dir}`);
  }

  /**
   * Upload files
   */

  const uploaded = await (async () => {
    const client = VercelUploadFiles({ ctx, teamId });
    const res = await client.upload(dir);
    const { ok, error, total } = res;
    const files = res.files.map((item) => item.file);
    const errors = res.files
      .filter((item) => Boolean(item.error))
      .map(({ file, error }) => `${file.file}: [${error?.code}] ${error?.message}`);

    return {
      ok,
      files,
      error,
      errors,
      total,
    };
  })();

  if (!uploaded.ok) {
    const { total } = uploaded;
    throw new Error(`Failed uploading ${total.failed} of ${total.files} files.`);
  }

  const files = uploaded.files;
  const paths = files.map(({ file }) => file);

  /**
   * Append the deployment's {meta} data object with
   * the manifest {module} details.
   */
  const readManifest = async () => {
    const path = fs.join(dir, 'index.json');

    if (!(await fs.exists(path))) return;
    const file = await fs.readFile(path);
    const manifest = JSON.parse(file.toString()) as t.ModuleManifest;

    return typeof manifest === 'object' && manifest.kind === 'module' ? manifest : undefined;
  };

  const manifest = await readManifest();

  const meta: t.VercelHttpDeployMeta = manifest
    ? {
        ...manifest.module,
        kind: 'bundle:code/module',
        modulehash: manifest.hash.module,
        fileshash: manifest.hash.files,
        bytes: manifest.files.reduce((acc, next) => acc + next.bytes, 0).toString(),
      }
    : {
        kind: 'bundle:plain/files',
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

  /**
   * Response
   */
  const { ok, status } = res;
  const error = ok ? undefined : (json.error as t.VercelHttpError);
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
