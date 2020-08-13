import { Observable } from 'rxjs';

export type IDispose = {
  dispose(): void;
};

export type IDisposeProps = {
  readonly isDisposed: boolean;
  readonly dispose$: Observable<void>;
};

export type IDisposable = IDispose & IDisposeProps;
