import { Observable } from 'rxjs';
import * as t from '../types';

export type ILocalStorageProps<P = any> = Record<keyof P, P[keyof P]>;

export type ILocalStorage<P extends ILocalStorageProps<P>> = ILocalStorageProps<P> & {
  $: {
    events$: Observable<LocalStorageEvent>;
    get$: Observable<ILocalStorageGet<P>>;
    set$: Observable<ILocalStorageSet<P>>;
    delete$: Observable<ILocalStorageDelete<P>>;
  };
  delete(key: keyof P): ILocalStorage<P>;
};

export type ILocalStorageProvider = {
  get(key: string): t.Json | undefined;
  set(key: string, value: t.Json): t.Json | undefined;
  delete(key: string): void;
};

/**
 * [Events]
 */
export type LocalStorageEvent =
  | ILocalStorageGetEvent
  | ILocalStorageSetEvent
  | ILocalStorageDeleteEvent;

export type ILocalStorageGetEvent<P extends ILocalStorageProps<P> = any> = {
  type: 'LOCAL_STORAGE/get';
  payload: ILocalStorageGet<P>;
};
export type ILocalStorageGet<P extends ILocalStorageProps<P> = any> = {
  key: keyof P;
  value: P[keyof P];
};

export type ILocalStorageSetEvent<P extends ILocalStorageProps<P> = any> = {
  type: 'LOCAL_STORAGE/set';
  payload: ILocalStorageSet<P>;
};
export type ILocalStorageSet<P extends ILocalStorageProps<P> = any> = {
  key: keyof P;
  value: { from: P[keyof P]; to: P[keyof P] };
};

export type ILocalStorageDeleteEvent<P extends ILocalStorageProps<P> = any> = {
  type: 'LOCAL_STORAGE/delete';
  payload: ILocalStorageDelete<P>;
};
export type ILocalStorageDelete<P extends ILocalStorageProps<P> = any> = {
  key: keyof P;
  value: P[keyof P];
};
