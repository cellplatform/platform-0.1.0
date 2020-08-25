import { Subject } from 'rxjs';
import { t } from '../common';

export type IEnv = {
  host: string;
  def: string;
  cache: t.IMemoryCache;
  event$: Subject<t.Event>;
};
export type ITopWindow = { env: IEnv };
