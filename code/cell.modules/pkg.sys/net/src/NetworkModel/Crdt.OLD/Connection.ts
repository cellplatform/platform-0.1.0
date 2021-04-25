import Automerge from 'automerge';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { cuid, defaultValue, rx, t } from '../../common';
import * as types from './types';

export function Connection(args: {
  docs: Automerge.DocSet<any>;
  bus: t.EventBus<any>;
  isEnabled?: boolean;
  encode?: (msg: any) => string;
  decode?: (msg: string) => any;
}): types.CrdtConnection {
  const id = cuid();
  const { docs } = args;

  console.log('id', id);

  const encode = args.encode || JSON.stringify;
  const decode = args.decode || JSON.parse;

  const dispose$ = new Subject<void>();
  const dispose = () => {
    dispose$.next();
    conn.close();
  };

  const bus = args.bus.type<types.CrdtEvent>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const sendMessage = (msg: Automerge.Message) => {
    const connection = id;
    const model = msg.docId;
    const changes = encode(msg);
    console.log('send', msg);
    bus.fire({
      type: 'CRDT/broadcast/change',
      payload: { id: { connection, model }, changes },
    });
  };

  /**
   * Listen for INCOMING changes.
   */
  rx.payload<types.CrdtBroadcastChangeEvent>($, 'CRDT/broadcast/change')
    .pipe(
      filter((e) => e.id.connection !== id),
      // filter((e) => Array.from(docs.docIds).some((id) => id === e.id.model)),
    )
    .subscribe((e) => {
      console.log('-------------------------------------------');
      const changes = decode(e.changes);
      conn.receiveMsg(changes);
    });

  let isEnabled = defaultValue(args.isEnabled, true);
  const enabledChanged = (isEnabled: boolean) => {
    if (isEnabled) conn.open();
    if (!isEnabled) conn.close();
  };

  // Initialize.
  const conn = new Automerge.Connection(docs, sendMessage);
  enabledChanged(isEnabled);

  return {
    id,
    dispose,
    dispose$: dispose$.asObservable(),

    get isEnabled() {
      return isEnabled;
    },
    set isEnabled(value: boolean) {
      if (value !== isEnabled) {
        isEnabled = value;
        enabledChanged(value);
      }
    },
  };
}
