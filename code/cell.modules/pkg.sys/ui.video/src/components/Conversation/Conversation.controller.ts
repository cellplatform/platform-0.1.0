import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { PeerJS, R, rx, t } from './common';

/**
 * Manages state changes.
 */
export function stateController(args: { bus: t.EventBus<any>; model: t.ConversationModel }) {
  const { model } = args;
  let peer: PeerJS;
  const connections: PeerJS.DataConnection[] = [];

  const bus = args.bus.type<t.ConversationEvent>();
  const dispose = () => dispose$.next();
  const dispose$ = new Subject<void>();
  const $ = bus.event$.pipe(takeUntil(dispose$));

  const changeModel = (data: Partial<t.ConversationState>) => {
    bus.fire({
      type: 'Conversation/model/change',
      payload: { data },
    });
  };

  /**
   * Init
   */
  rx.payload<t.ConversationCreatedEvent>($, 'Conversation/created')
    .pipe()
    .subscribe((e) => {
      peer = e.peer;
      /**
       * INCOMING (Recieve)
       */
      peer.on('connection', (conn) => {
        conn.on('data', (data) => {
          if (typeof data === 'object') changeModel(data);
        });
      });
    });

  /**
   * Peer connected. Setup outgoing connection.
   */
  rx.payload<t.ConversationConnectEvent>($, 'Conversation/connect')
    .pipe(filter((e) => Boolean(peer)))
    .subscribe((e) => {
      const conn = peer.connect(e.id);
      conn.on('open', () => {
        connections.push(conn);
        bus.fire({
          type: 'Conversation/model/publish',
          payload: { data: {} }, // NB: Ensure the peer's meta-data is published.
        });
      });
    });

  /**
   * Listen for data publish events.
   */
  rx.payload<t.ConversationModelPublishEvent>($, 'Conversation/model/publish')
    .pipe(filter((e) => Boolean(peer)))
    .subscribe((e) => {
      const id = peer.id;
      const peers: t.ConversationStatePeers = {
        [id]: { id, userAgent: navigator.userAgent, isSelf: true, resolution: {} },
      };

      const data = R.mergeDeepRight(e.data, { peers }) as t.ConversationState;
      changeModel(data);
      connections.forEach((conn) => conn.send(model.state));
    });

  /**
   * Update model with new state.
   */
  rx.payload<t.ConversationModelChangeEvent>($, 'Conversation/model/change')
    .pipe(filter((e) => Boolean(peer)))
    .subscribe((e) => {
      const state = R.mergeDeepRight(model.state, e.data) as t.ConversationState;

      Object.keys(state.peers)
        .filter((id) => id !== peer.id)
        .forEach((id) => delete state.peers[id].isSelf); // NB: Clean up other peer data.

      if (!R.equals(state, model.state)) {
        model.change(state);
      }
    });

  return {
    dispose$: dispose$.asObservable(),
    dispose,
  };
}
