import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { slug, t } from '../common';

type Uri = string;
type WorkerEntry = {
  uri: Uri;
  worker: Worker;
  isLoaded: boolean;
  fire(e: t.ThreadEvent): void;
  dispose(): void;
};

/**
 * Initializes a [NetworkPump] for a Window side of a WebWorker thread.
 */
export function WindowTransport(): t.WindowTransport {
  if (typeof document === 'undefined') {
    const err = `[WindowTransport] should not be instantiated on a Worker thread.`;
    throw new Error(err);
  }

  const uri: Uri = 'thread:window';
  const dispose$ = new Subject<void>();
  const message$ = new Subject<t.ThreadMessage>();

  let refs: WorkerEntry[] = [];
  const broadcast = (e: t.ThreadEvent) => refs.forEach((ref) => ref.fire(e));

  const Find = {
    refByWorker: (worker: Worker) => refs.find((ref) => ref.worker === worker),
    refByUri: (uri: Uri) => refs.find((ref) => ref.uri === uri),
    ref: (input: Worker | Uri) =>
      typeof input === 'string' ? Find.refByUri(input) : Find.refByWorker(input),
  };

  /**
   * Add a worker to the transport.
   */
  const add = (worker: Worker) => {
    const exists = Boolean(Find.refByWorker(worker));
    if (exists) return transport; // Already added.

    const ref: WorkerEntry = {
      uri: `loading:${slug()}`, // NB: URI is set once worker has responds to the initialization.
      worker,
      get isLoaded() {
        return !ref.uri.startsWith('loading:');
      },
      fire: (e: t.ThreadEvent) => worker.postMessage(e),
      dispose() {
        worker.removeEventListener('message', handleMessage);
        refs = refs.filter(({ uri }) => uri !== ref.uri);
      },
    };
    refs.push(ref);

    const init = (loaded: Uri) => {
      ref.uri = loaded;
      const workers = refs.filter((ref) => ref.isLoaded).map((ref) => ref.uri);
      broadcast({
        type: 'runtime.web/thread/loaded',
        payload: { loaded, state: { window: uri, workers } },
      });
    };

    const handleMessage = (message: MessageEvent<t.ThreadEvent>) => {
      const e = message.data;
      if (e.type === 'runtime.web/thread/worker/init:res' && e.payload.tx === tx) {
        init(e.payload.uri);
      }
      if (e.type === 'runtime.web/thread/msg') {
        message$.next(e.payload);
      }
    };

    worker.addEventListener('message', handleMessage);

    const tx = slug();
    ref.fire({ type: 'runtime.web/thread/worker/init:req', payload: { tx } });

    return transport;
  };

  /**
   * Remove a worker from the transport.
   */
  const remove = (worker: Worker | Uri) => {
    Find.ref(worker)?.dispose();
    return transport;
  };

  const pump: t.NetworkPump<t.Event> = {
    /**
     * Recieve incoming event messages from workers.
     */
    in: (fn) => {
      message$.pipe(takeUntil(dispose$)).subscribe((e) => fn(e.data));
    },

    /**
     * Broadcast event to workers.
     */
    out: (e) => {
      const { targets, event: data } = e;
      const sender = uri;
      broadcast({
        type: 'runtime.web/thread/msg',
        payload: { sender, targets, data },
      });
    },
  };

  const local = async () => uri;
  const remotes = async () =>
    refs
      .filter((ref) => ref.isLoaded)
      .filter((ref) => ref.uri !== uri)
      .map((ref) => ref.uri);

  /**
   * Finish up.
   */
  const dispose = () => {
    refs.forEach((ref) => ref.dispose());
    dispose$.next();
  };
  const transport: t.WindowTransport = { uri, local, remotes, pump, add, remove, dispose };
  return transport;
}
