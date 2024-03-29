import { filter, takeUntil } from 'rxjs/operators';

import { Stream } from '../web.Stream';
import { BusEventsCell } from './BusEvents.Cell';
import { BusEventsFs } from './BusEvents.Fs';
import { BusEventsIndexer } from './BusEvents.Indexer';
import { BusEventsIo } from './BusEvents.Io';
import { rx, t, timeoutWrangler } from './common';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event API.
 */
export function BusEvents(args: {
  id: FilesystemId;
  bus: t.EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
  timeout?: Milliseconds; // Default timeout.
  toUint8Array?: t.SysFsToUint8Array;
  dispose$?: t.Observable<any>;
}): t.SysFsEvents {
  const { id } = args;
  const { dispose, dispose$ } = rx.disposable(args.dispose$);
  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const is = BusEvents.is;
  const toUint8Array = args.toUint8Array ?? Stream.toUint8Array;

  const toTimeout = timeoutWrangler(args.timeout);
  const msecs = toTimeout();

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, id)),
    filter((e) => args.filter?.(e) ?? true),
  );

  const changed$ = rx.payload<t.SysFsChangedEvent>($, 'sys.fs/changed');

  /**
   * Initialize sub-event API's
   */
  const io = BusEventsIo({ id, $, bus, timeout: msecs });
  const index = BusEventsIndexer({ id, $, bus, timeout: msecs });
  const remote = BusEventsCell({ id, $, bus, timeout: msecs });

  /**
   * Filesystem API.
   */
  const fs: t.SysFsEvents['fs'] = (input) => {
    const options = typeof input === 'string' ? { dir: input } : input;
    const { dir } = options ?? {};
    const timeout = toTimeout(options);
    const io = BusEventsIo({ id, $, bus, timeout });
    const index = BusEventsIndexer({ id, $, bus, timeout });
    return BusEventsFs({ dir, index, io, toUint8Array });
  };

  /**
   * Ready check.
   */
  const ready: t.SysFsReady = async (options = {}) => {
    const { timeout = 500, retries = 5 } = options;

    const ping = async (retries: number): Promise<t.SysFsReadyRes> => {
      const ready = !(await io.info.get({ timeout })).error;
      if (!ready && retries > 1) return await ping(retries - 1); // <== RECURSION 🌳
      if (ready) return { ready: true };
      return {
        ready: false,
        error: {
          code: 'client/timeout',
          message: `Filesystem '${id}' did not respond after ${retries} attempts`,
        },
      };
    };

    return await ping(retries);
  };

  /**
   * API
   */
  return { id, $, changed$, is, dispose, dispose$, ready, io, index, fs, remote };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.fs/'),
  instance: (e: t.Event, id: FilesystemId) => BusEvents.is.base(e) && e.payload?.id === id,
};
