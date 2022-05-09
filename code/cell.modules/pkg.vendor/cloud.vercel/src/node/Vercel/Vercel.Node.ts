import { nodefs, rx, Filesystem, Http } from './common';
import { VercelHttp } from '../Vercel.Http';

type ApiToken = string;
type DirectoryPath = string;
type Milliseconds = number;

type Args = {
  token: ApiToken;
  dir?: DirectoryPath;
  timeout?: Milliseconds;
};

/**
 * Starts a vercel controller using a local [node/fs] process.
 */
export const VercelNode = (args: Args) => {
  const { token, timeout = 30000 } = args;
  const driver = nodefs.resolve(args.dir ?? '');

  const bus = rx.bus();
  const http = Http.create();
  const store = Filesystem.Controller({ bus, driver });
  const fs = store.fs({ timeout });
  const client = VercelHttp({ fs, token });

  const { dispose, dispose$ } = store;
  return { dispose, dispose$, fs, client, http };
};
