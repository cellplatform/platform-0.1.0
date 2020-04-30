import { Observable } from 'rxjs';

export type QueueHandler<T> = () => Promise<T>;

export type IMemoryQueue = {
  readonly length: number;
  readonly isEmpty: boolean;
  readonly isRunning: boolean;
  readonly isDisposed: boolean;
  readonly dispose$: Observable<{}>;
  dispose(): void;
  push<T>(handler: QueueHandler<T>): Promise<T>;
};
