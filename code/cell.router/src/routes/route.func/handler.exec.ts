import { defaultValue, Schema, t, util } from '../common';

type B = t.RuntimeBundleOrigin;

export async function exec(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncBody;
}) {
  try {
    const { host, db, runtime } = args;
    const bundles = Array.isArray(args.body) ? args.body : [args.body];
    const results: t.IResPostFuncBundle[] = [];

    for (const body of bundles) {
      const res = await execBundle({ host, db, body, runtime });
      results.push(res);
    }

    const elapsed = results.reduce((acc, next) => acc + next.elapsed, 0);
    const data: t.IResPostFunc = {
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
 * Executes a single bundle.
 */
async function execBundle(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncBundle;
}) {
  const startedAt = new Date();
  const { body, runtime } = args;
  const silent = defaultValue(body.silent, true);

  const host = body.host || args.host;
  const uri = body.uri;
  const dir = body.dir;
  const pull = body.pull;
  const bundle: B = { host, uri, dir };
  const urls = Schema.urls(bundle.host);

  const exists = await runtime.exists(bundle);
  const res = await runtime.run(bundle, { silent, pull });
  const { manifest, errors } = res;

  const data: t.IResPostFuncBundle = {
    ok: res.ok,
    elapsed: new Date().getTime() - startedAt.getTime(),
    bundle,
    cache: { exists, pulled: pull ? true : !exists },
    runtime: { name: runtime.name },
    size: {
      bytes: defaultValue(manifest?.bytes, -1),
      files: defaultValue(manifest?.files.length, -1),
    },
    urls: {
      files: urls.runtime.bundle.files(bundle).toString(),
      manifest: urls.runtime.bundle.manifest(bundle).toString(),
    },
    errors,
  };

  // Finish up.
  return data;
}
