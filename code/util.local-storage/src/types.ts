import { Observable } from 'rxjs';

import { Json } from '@platform/types';
export { Json, JsonMap } from '@platform/types';

export type ILocalStorageProps<T> = { [P in keyof T]: T[P] };

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
  type: string;
  get(key: string): Json | undefined;
  set(key: string, value: Json): Json | undefined;
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
  key: string;
  prop: keyof P;
  value: P[keyof P];
};

export type ILocalStorageSetEvent<P extends ILocalStorageProps<P> = any> = {
  type: 'LOCAL_STORAGE/set';
  payload: ILocalStorageSet<P>;
};
export type ILocalStorageSet<P extends ILocalStorageProps<P> = any> = {
  key: string;
  prop: keyof P;
  value: { from: P[keyof P]; to: P[keyof P] };
};

export type ILocalStorageDeleteEvent<P extends ILocalStorageProps<P> = any> = {
  type: 'LOCAL_STORAGE/delete';
  payload: ILocalStorageDelete<P>;
};
export type ILocalStorageDelete<P extends ILocalStorageProps<P> = any> = {
  key: string;
  prop: keyof P;
  value: P[keyof P];
};
