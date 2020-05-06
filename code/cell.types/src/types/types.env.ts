import { Observable } from 'rxjs';
import { t } from '../common';

export type EnvEvent = t.TypedSheetEvent;

export type IEnv = {
  host: string;
  def: string;
  cache: t.IMemoryCache;
  event$: Observable<EnvEvent>;
};
export type ITopWindow = { env: IEnv };
