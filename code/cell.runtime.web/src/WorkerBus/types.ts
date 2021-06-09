import { Event } from '@platform/types';
import { NetworkPump } from '@platform/cell.types/lib/types.Bus/types.NetworkPump';
import { NetworkBus } from '@platform/cell.types/lib/types.Bus/types.NetworkBus';

export { Event, NetworkPump, NetworkBus };

type Uri = string;

type Transport = {
  uri: Uri;
  pump: NetworkPump<Event>;
  local(): Promise<Uri>;
  remotes(): Promise<Uri[]>;
  dispose(): void;
};

export type WindowTransport = Transport & {
  add(worker: Worker): WindowTransport;
  remove(worker: Worker | Uri): WindowTransport;
};

export type WorkerTransport = Transport;

/**
 * EVENTS
 */
export type ThreadEvent =
  | ThreadWorkerInitReqEvent
  | ThreadWorkerInitResEvent
  | ThreadMessageEvent
  | ThreadLoadedEvent;

/**
 * Fires during the initialization of a worker.
 */
export type ThreadWorkerInitReqEvent = {
  type: 'runtime.web/thread/worker/init:req';
  payload: ThreadWorkerInitReq;
};
export type ThreadWorkerInitReq = { tx: string };

export type ThreadWorkerInitResEvent = {
  type: 'runtime.web/thread/worker/init:res';
  payload: ThreadWorkerInitRes;
};
export type ThreadWorkerInitRes = { tx: string; uri: Uri };

/**
 * Fired when a thread emits a data event.
 */
export type ThreadMessageEvent = {
  type: 'runtime.web/thread/msg';
  payload: ThreadMessage;
};
export type ThreadMessage = {
  sender: Uri;
  targets: Uri[];
  data: Event;
};

/**
 * Fired to alert listeners when a worker is loaded and ready.
 */
export type ThreadLoadedEvent = {
  type: 'runtime.web/thread/loaded';
  payload: ThreadLoaded;
};
export type ThreadLoaded = {
  loaded: Uri;
  state: { window: Uri; workers: Uri[] };
};
