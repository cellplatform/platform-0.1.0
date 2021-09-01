import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { slug, t } from '../common';

type Uri = string;
type State = { window: Uri; workers: Uri[] };

const getSelf = () => {
  if (typeof self !== 'undefined') return self as any;
  if (typeof window !== 'undefined') return window as any;
  throw new Error(`self context not found`);
};

/**
 * Initializes a [NetworkPump] for a WebWorker thread.
 */
export function WorkerTransport(): t.WorkerTransport {
  if (typeof document !== 'undefined') {
    const err = `[WorkerTransport] should not be instantiated on the main Window thread.`;
    throw new Error(err);
  }

  const ctx: Worker = getSelf();
  const uri: Uri = `thread:worker:${slug()}`;
  const dispose$ = new Subject<void>();
  const message$ = new Subject<t.ThreadMessage>();
  let state: State = { window: 'thread:window', workers: [] };

  const fire = (e: t.ThreadEvent) => ctx.postMessage(e);

  const handleMessage = (message: MessageEvent<t.ThreadEvent>) => {
    const e = message.data;
    if (e.type === 'runtime.web/thread/worker/init:req') {
      const { tx } = e.payload;
      fire({ type: 'runtime.web/thread/worker/init:res', payload: { tx, uri } });
    }
    if (e.type === 'runtime.web/thread/loaded') {
      state = e.payload.state;
      console.log('state', state);
    }
    if (e.type === 'runtime.web/thread/msg') {
      message$.next(e.payload);
    }
  };

  const pump: t.NetworkPump<t.Event> = {
    /**
     * Recieve incoming events from the main/worker threads.
     */
    in: (fn) => {
      message$.pipe(takeUntil(dispose$)).subscribe((e) => fn(e.data));
    },

    /**
     * Broadcast event to other threads.
     */
    out: (e) => {
      const { targets, event: data } = e;
      const sender = uri;
      fire({
        type: 'runtime.web/thread/msg',
        payload: { sender, targets, data },
      });
    },
  };

  const local = async () => uri;
  const remotes = async () => [...state.workers, state.window].filter((item) => item !== uri);

  /**
   * Finish up.
   */
  ctx.addEventListener('message', handleMessage);
  const dispose = () => {
    ctx.removeEventListener('message', handleMessage);
    dispose$.next();
  };
  const transport: t.WorkerTransport = { uri, local, remotes, pump, dispose };
  return transport;
}
