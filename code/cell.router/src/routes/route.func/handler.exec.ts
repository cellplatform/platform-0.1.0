import { defaultValue, Schema, t, util } from '../common';

type B = t.RuntimeBundleOrigin;

/**
 * Executes a function in the given runtime.
 */
export async function exec(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncRunBody;
  defaultPull?: boolean;
  defaultSilent?: boolean;
}) {
  try {
    const { host, db, runtime, defaultPull, defaultSilent } = args;
    const bundles = Array.isArray(args.body) ? args.body : [args.body];
    const results: t.IResPostFuncRunResult[] = [];

    for (const body of bundles) {
      const res = await execBundle({ host, db, body, runtime, defaultPull, defaultSilent });
      results.push(res);
    }

    const elapsed = results.reduce((acc, next) => acc + next.elapsed, 0);
    const data: t.IResPostFuncRun = {
      elapsed,
      results,
    };

    const status = data.results.every((res) => res.ok) ? 200 : 500;
    return { status, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

/**
 * Executes a single function bundle.
 */
async function execBundle(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncRun;
  defaultPull?: boolean;
  defaultSilent?: boolean;
}) {
  const startedAt = new Date();
  const { body, runtime } = args;
  const silent = defaultValue(body.silent, defaultValue(args.defaultSilent, true));

  const host = body.host || args.host;
  const uri = body.uri;
  const dir = body.dir;
  const pull = defaultValue(body.pull, args.defaultPull || false);
  const bundle: B = { host, uri, dir };
  const urls = Schema.urls(bundle.host);

  const exists = await runtime.exists(bundle);
  const res = await runtime.run(bundle, { silent, pull });
  const { manifest, errors } = res;

  const data: t.IResPostFuncRunResult = {
    ok: res.ok,
    elapsed: new Date().getTime() - startedAt.getTime(),
    bundle,
    cache: { exists, pulled: pull ? true : !exists },
    runtime: { name: runtime.name, silent },
    size: {
      bytes: defaultValue(manifest?.bytes, -1),
      files: defaultValue(manifest?.files.length, -1),
    },
    urls: {
      files: urls.fn.bundle.files(bundle).toString(),
      manifest: urls.fn.bundle.manifest(bundle).toString(),
    },
    errors,
  };

  // Finish up.
  return data;
}
