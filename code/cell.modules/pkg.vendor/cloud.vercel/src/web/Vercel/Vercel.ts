import { VercelHttp as Http } from './Vercel.Http';
import { VercelFs as Fs } from './Vercel.Fs';
import { VercelDeploy as Deploy } from './Vercel.Deploy';
import { VercelInfo as Info } from './Vercel.Info';

export const Vercel = {
  Fs,
  Http,
  Deploy,
  Info,
};
