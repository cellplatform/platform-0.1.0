import { Observable } from 'rxjs';
import { IDisposable } from './types.dispose';

type O = Record<string, unknown>;
type D = IDisposable;

export type Event<P extends O = any> = {
  type: string;
  payload: P;
};

export type FireEvent<E extends Event> = (event: E) => void;

export type IEventStrategy<E extends Event, R extends D = D> = {
  listen(event$: Observable<E>, until?: Observable<any>): R;
};
