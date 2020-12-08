import { defaultValue, Schema, t, util, id } from '../common';

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
        const prep = acc.prep + next.elapsed.prep;
        const run = acc.run + next.elapsed.run;
        return { prep, run };
      },
      { prep: 0, run: 0 },
    );

    const ok = results.every((res) => res.ok);
    const status = results.every((res) => res.ok) ? 200 : 500;
    const data: t.IResPostFuncRun = {
      ok,
      elapsed,
      results,
    };

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

  const { uri, dir, entry, hash } = body;
  const host = body.host || args.host;
  const pull = defaultValue(body.pull, args.defaultPull || false);
  const timeout = defaultValue(body.timeout, args.defaultTimeout);
  const bundle: B = { host, uri, dir };
  const urls = Schema.urls(bundle.host);

  const exists = await runtime.exists(bundle);
  const options: t.RuntimeRunOptions = { silent, pull, in: body.in, timeout, entry, hash };
  const res = await runtime.run(bundle, options);
  const { ok, manifest, errors } = res;
  const tx = body.tx || id.cuid();

  const data: t.IResPostFuncRunResult = {
    ok,
    tx,
    out: res.out,
    elapsed: res.elapsed,
    bundle,
    entry: res.entry,
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
