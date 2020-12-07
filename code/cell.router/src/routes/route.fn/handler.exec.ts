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
  defaultTimeout?: number;
}) {
  try {
    const { host, db, runtime, defaultPull, defaultSilent, defaultTimeout } = args;
    const bundles = Array.isArray(args.body) ? args.body : [args.body];
    const results: t.IResPostFuncRunResult[] = [];

    for (const body of bundles) {
      const res = await execBundle({
        host,
        db,
        body,
        runtime,
        defaultPull,
        defaultSilent,
        defaultTimeout,
      });
      results.push(res);
    }

    const elapsed = results.reduce(
      (acc, next) => {
        return { prep: acc.prep + next.elapsed.prep, run: acc.run + next.elapsed.run };
      },
      { prep: 0, run: 0 },
    );
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
  defaultTimeout?: number;
}) {
  const { body, runtime } = args;
  const silent = defaultValue(body.silent, defaultValue(args.defaultSilent, true));

  const { uri, dir, params } = body;
  const host = body.host || args.host;
  const pull = defaultValue(body.pull, args.defaultPull || false);
  const timeout = defaultValue(body.timeout, args.defaultTimeout);
  const bundle: B = { host, uri, dir };
  const urls = Schema.urls(bundle.host);

  const exists = await runtime.exists(bundle);
  const res = await runtime.run(bundle, { silent, pull, params, timeout });
  const { manifest, errors } = res;

  const data: t.IResPostFuncRunResult = {
    ok: res.ok,
    result: res.result,
    elapsed: res.elapsed,
    bundle,
    cache: { exists, pulled: pull ? true : !exists },
    runtime: { name: runtime.name, version: runtime.version, silent },
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
