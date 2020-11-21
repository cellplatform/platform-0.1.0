import { t, util } from '../common';

export async function execFunc(args: {
  host: string;
  db: t.IDb;
  runtime: t.RuntimeEnv;
  body: t.IReqPostFuncBody;
}) {
  try {
    const { body } = args;
    console.log('HANDLER: execFunc', body); // TEMP 🐷

    const host = body.host || args.host;
    const uri = body.uri;

    const data: t.IResPostFunc = { host, uri };

    // Finish up.
    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
