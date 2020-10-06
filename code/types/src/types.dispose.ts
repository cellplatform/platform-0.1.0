import { Observable } from 'rxjs';

export type IDisposable = {
  dispose(): void;
  readonly dispose$: Observable<void>;
};
