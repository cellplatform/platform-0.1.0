import { Observable } from 'rxjs';
import { t } from '../common';

export type EnvEvent = t.TypedSheetEvent;

export type IEnv<E = EnvEvent> = {
  host: string;
  def: string;
  cache: t.IMemoryCache;
  event$: Observable<E>;
};
export type ITopWindow = { env: IEnv };
