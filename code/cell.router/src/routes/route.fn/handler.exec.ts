import { value, id, t, util, R } from '../common';

type B = t.BundleCellAddress;

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
  defaultTimeout?: t.Timeout;
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
      // Process in ["serial"] list order.
      let previous: t.IResPostFuncResult | undefined;
      for (const body of args.body) {
        previous = await run(body, previous);

        // If errors occured determine continuation behavior.
        if (previous.errors.length > 0) {
          const onError = body.onError ?? args.defaultOnError ?? 'stop';
          if (onError === 'stop') {
            break;
          }
        }
      }
    } else {
      // Process in ["parallel"].
      const items = Object.keys(args.body).map((key) => args.body[key] as t.IReqPostFunc);
      const bundleUrls = R.uniq(items.map(({ bundle }) => bundle));
      await Promise.all(bundleUrls.map((url) => runtime.pull(url, { silent: true })));
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
  } catch (err: any) {
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
  defaultTimeout?: t.Timeout;
}) {
  const { body, runtime } = args;
  const silent = body.silent ?? args.defaultSilent ?? true;

  const { entry, fileshash } = body;
  const manifestUrl = body.bundle;

  const pull = body.pull ?? args.defaultPull ?? false;
  const timeout = body.timeout ?? args.defaultTimeout;

  const exists = await runtime.exists(manifestUrl);
  const res = await runtime.run(manifestUrl, {
    silent,
    pull,
    in: { ...args.in, ...body.in },
    timeout,
    entry,
    fileshash,
  });

  const { ok, manifest, errors } = res;
  const tx = body.tx || id.cuid();
  const files = manifest?.files;

  const data: t.IResPostFuncResult = {
    ok,
    tx,
    out: res.out,
    elapsed: res.elapsed,
    entry: res.entry,
    bundle: {
      url: manifestUrl,
      fileshash: manifest?.hash.files || '',
      version: manifest?.module?.version || '',
    },
    cache: { exists, pulled: pull ? true : !exists },
    size: {
      bytes: files ? files.reduce((acc, next) => acc + next.bytes, 0) : -1,
      files: files?.length ?? -1,
    },
    errors,
    silent,
  };

  // Finish up.
  return data;
}
