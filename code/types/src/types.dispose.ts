import { Observable } from 'rxjs';

export type IDispose = {
  dispose(): void;
};

export type IDisposable = IDispose & {
  readonly isDisposed: boolean;
  readonly dispose$: Observable<void>;
};
