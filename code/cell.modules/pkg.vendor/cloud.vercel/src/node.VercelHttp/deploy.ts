import { asArray, t, util, deleteUndefined } from './common';
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
  const { ctx, source, team, project } = args;
  const { http, fs, headers } = ctx;
  const teamId = team.id;

  if (typeof source === 'string' && !(await fs.is.dir(source))) {
    throw new Error(`The source path is not a directory. ${source}`);
  }

  /**
   * Upload files.
   */
  const uploaded = await (async () => {
    const client = VercelUploadFiles({ ctx, teamId });
    const res = await client.upload(source);
    const { ok, error, total } = res;
    const files = res.files.map((item) => item.file);
    const errors = res.files
      .filter((item) => Boolean(item.error))
      .map(({ file, error }) => `${file.file}: [${error?.code}] ${error?.message}`);

    return deleteUndefined({
      ok,
      files,
      error,
      errors,
      total,
    });
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
  const readManifest = async (dir: string) => {
    const path = fs.join(dir, 'index.json');
    const manifest = await fs.json.read<t.Manifest>(path);
    return manifest;
  };

  let name = args.name;
  const manifest = typeof source === 'string' ? await readManifest(source) : source.manifest;

  let meta: t.VercelHttpDeployMeta = { kind: 'bundle:plain/files' };
  if (manifest) {
    const kind = (manifest as any)?.kind;
    if (kind === 'module') {
      const m = manifest as t.ModuleManifest;
      name = name ?? `${m.module.namespace}-v${m.module.version}`;
      meta = {
        ...m.module,
        kind: 'bundle:code/module',
        modulehash: m.hash.module,
        fileshash: m.hash.files,
        bytes: m.files.reduce((acc, next) => acc + next.bytes, 0).toString(),
      };
    }
  }

  /**
   * HTTP BODY
   * Request Parameters:
   *    https://vercel.com/docs/api#endpoints/deployments/create-a-new-deployment/request-parameters
   */
  name = name ?? 'unnamed';
  const alias = asArray(args.alias).filter(Boolean) as string[];
  const target = args.target ?? 'staging';
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
    target,
    alias,
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
  const aliasUrls = target !== 'production' ? [] : alias.map((url) => `https://${url}`);
  const urls = {
    inspect: util.ensureHttps(json.inspectorUrl),
    public: [util.ensureHttps(json.url), ...aliasUrls],
  };
  const deployment = {
    id: json.id ?? '',
    team: { name: team.name, id: team.id },
    project: { name: project.name, id: project.id },
    target,
    regions: json.regions ?? [],
    alias,
    meta,
    urls,
  };

  return deleteUndefined({
    ok,
    status,
    deployment,
    paths,
    error,
  });
}
