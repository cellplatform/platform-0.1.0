import { value, defaultValue, id, t, util, R } from '../common';

type B = t.RuntimeBundleOrigin;

/**
 * Executes a function in the given runtime.
 */
export async function exec(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncBody;
  defaultPull?: boolean;
  defaultSilent?: boolean;
  defaultTimeout?: number;
  defaultOnError?: t.OnFuncError;
  forceJson?: boolean;
}) {
  try {
    const { host, db, runtime, defaultPull, defaultSilent, defaultTimeout, forceJson } = args;
    const execution: t.IResPostFunc['execution'] = Array.isArray(args.body) ? 'serial' : 'parallel';

    const results: t.IResPostFuncResult[] = [];
    const run = async (body: t.IReqPostFunc, previous?: t.IResPostFuncResult) => {
      const result = await execBundle({
        host,
        db,
        body,
        in: previous?.out, // NB: pipe previous result into the next function.
        runtime,
        defaultPull,
        defaultSilent,
        defaultTimeout,
      });
      results.push(result);
      return result;
    };

    if (Array.isArray(args.body)) {
      // Process in [serial] list order.
      let previous: t.IResPostFuncResult | undefined;
      for (const body of args.body) {
        previous = await run(body, previous);

        // If errors occured determine continuation behavior.
        if (previous.errors.length > 0) {
          const onError = defaultValue(body.onError, args.defaultOnError || 'stop');
          if (onError === 'stop') {
            break;
          }
        }
      }
    } else {
      // Process in [parallel].
      type B = t.RuntimeBundleOrigin;
      const items = Object.keys(args.body).map((key) => args.body[key] as t.IReqPostFunc);
      const bundles = R.uniq(items.map(({ uri, host, dir }) => ({ uri, host, dir } as B)));
      await Promise.all(bundles.map((bundle) => runtime.pull(bundle, { silent: true })));
      await Promise.all(items.map((body) => run(body)));
    }

    const ok = results.every((res) => res.ok);
    const status = results.every((res) => res.ok) ? 200 : 500;
    const elapsed = results.reduce((acc, next) => acc + (next.elapsed.prep + next.elapsed.run), 0);

    const last = results[results.length - 1]?.out;
    const lastContentType = last?.info.headers.contentType;

    if (ok && last && lastContentType && lastContentType !== 'application/json' && !forceJson) {
      return {
        status,
        data: last.value,
        headers: value.deleteEmpty({
          'content-type': lastContentType,
          'content-def': last.info.headers.contentDef || '',
        }),
      };
    } else {
      const data: t.IResPostFunc = {
        ok,
        elapsed,
        execution,
        runtime: { name: runtime.name, version: runtime.version },
        results,
      };
      return { status, data };
    }
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
  const files = manifest?.files;

  const data: t.IResPostFuncResult = {
    ok,
    tx,
    out: res.out,
    elapsed: res.elapsed,
    bundle: { ...bundle, hash: manifest?.hash.files },
    entry: res.entry,
    cache: { exists, pulled: pull ? true : !exists },
    size: {
      bytes: files ? files.reduce((acc, next) => acc + next.bytes, 0) : -1,
      files: defaultValue(files?.length, -1),
    },
    errors,
    silent,
  };

  // Finish up.
  return data;
}
