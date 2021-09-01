import { Observable } from 'rxjs';

export type IDisposable = Disposable;
export type Disposable = {
  dispose(): void;
  readonly dispose$: Observable<void>;
};
