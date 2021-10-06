import { nodefs, rx, Filesystem } from './common';
import { VercelHttp } from '../node.VercelHttp';

type ApiToken = string;
type DirectoryPath = string;

type Args = {
  token: ApiToken;
  dir?: DirectoryPath;
  timeout?: number;
};

/**
 * Starts a vercel controller using a local [node/fs] process.
 */
export const VercelNode = (args: Args) => {
  const { token, timeout = 9999 } = args;

  const dir = nodefs.resolve(args.dir ?? '');
  const bus = rx.bus();
  const store = Filesystem.Controller({ bus, fs: dir });
  const fs = store.fs({ timeout });
  const client = VercelHttp({ fs, token });

  const { dispose, dispose$ } = store;
  return { dispose, dispose$, dir, fs, client };
};
