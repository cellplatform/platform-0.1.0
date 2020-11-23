import { defaultValue, Schema, t, time, util } from '../common';

type B = t.RuntimeBundleOrigin;

export async function execFunc(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncBody;
}) {
  try {
    const timer = time.timer();
    const { body, runtime } = args;

    console.log('HANDLER: execFunc', body); // TEMP 🐷
    console.log('-------------------------------------------');
    console.log('runtime', runtime);

    const host = body.host || args.host;
    const uri = body.uri;
    const dir = body.dir;
    const bundle: B = { host, uri, dir };

    const res = await runtime.run(bundle, { silent: true });
    const { manifest, errors } = res;

    const status = res.ok ? 200 : 500;
    const data: t.IResPostFunc = {
      elapsed: timer.elapsed.msec,
      runtime: { name: runtime.name },
      manifest: Schema.urls(host).func.manifest(bundle).toString(),
      size: {
        bytes: defaultValue(manifest?.bytes, -1),
        files: defaultValue(manifest?.files.length, -1),
      },
      errors,
    };

    // Finish up.
    return { status, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
