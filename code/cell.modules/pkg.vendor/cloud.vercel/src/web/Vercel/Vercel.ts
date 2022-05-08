import { VercelHttp as Http } from './Vercel.Http';
import { VercelFs as Fs } from './Vercel.Fs';
import { VercelDeploy as Deploy } from './Vercel.Deploy';

export const Vercel = {
  Fs,
  Http,
  Deploy,
};
