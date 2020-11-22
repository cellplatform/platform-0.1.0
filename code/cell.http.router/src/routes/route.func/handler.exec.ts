import { t, util } from '../common';

type B = t.RuntimeBundleOrigin;

export async function execFunc(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncBody;
}) {
  try {
    const { body, runtime } = args;

    console.log('HANDLER: execFunc', body); // TEMP 🐷
    console.log('-------------------------------------------');
    console.log('runtime', runtime);

    const host = body.host || args.host;
    const uri = body.uri;
    const dir = body.dir;

    const bundle: B = { host, uri, dir };

    console.log('bundle:::', bundle);

    try {
      const res = await runtime.run(bundle);
      console.log('res', res);
    } catch (error) {
      console.log('error', error);
    }

    const data: t.IResPostFunc = { host, uri };

    // Finish up.
    return { status: 200, data };
  } catch (err) {
    console.log('err', err);
    return util.toErrorPayload(err);
  }
}
