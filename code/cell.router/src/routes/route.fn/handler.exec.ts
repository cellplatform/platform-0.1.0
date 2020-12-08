import { defaultValue, id, t, util } from '../common';

type B = t.RuntimeBundleOrigin;

/**
 * Executes a function in the given runtime.
 */
export async function exec(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncSet;
  defaultPull?: boolean;
  defaultSilent?: boolean;
  defaultTimeout?: number;
}) {
  try {
    const { host, db, runtime, defaultPull, defaultSilent, defaultTimeout } = args;

    const results: t.IResPostFuncResult[] = [];
    const run = async (body: t.IReqPostFunc, prev?: t.IResPostFuncResult) => {
      const result = await execBundle({
        host,
        db,
        body,
        in: prev?.out, // NB: pipe previous result into the next function.
        runtime,
        defaultPull,
        defaultSilent,
        defaultTimeout,
      });
      results.push(result);
      return result;
    };

    if (Array.isArray(args.body)) {
      // Process seqential list in order.
      let prev: t.IResPostFuncResult | undefined;
      for (const body of args.body) {
        prev = await run(body, prev);
      }
    } else {
      // Process in parallel.
      // TODO 🐷
      // await Promise.all(Object.keys(args.body).map((key) => ))
    }

    const ok = results.every((res) => res.ok);
    const elapsed = results.reduce((acc, next) => acc + (next.elapsed.prep + next.elapsed.run), 0);
    const data: t.IResPostFunc = { ok, elapsed, results };

    const status = results.every((res) => res.ok) ? 200 : 500;
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
  body: t.IReqPostFunc;
  in?: t.RuntimeIn; // NB: From previous [out] within pipeline.
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

  const exists = await runtime.exists(bundle);
  const options: t.RuntimeRunOptions = {
    silent,
    pull,
    in: { ...args.in, ...body.in },
    timeout,
    entry,
    hash,
  };
  const res = await runtime.run(bundle, options);
  const { ok, manifest, errors } = res;
  const tx = body.tx || id.cuid();

  const data: t.IResPostFuncResult = {
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
    errors,
  };

  // Finish up.
  return data;
}
