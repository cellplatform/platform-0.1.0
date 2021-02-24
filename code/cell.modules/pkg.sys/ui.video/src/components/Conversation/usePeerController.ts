import React, { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs/operators';
import { PeerJS, rx, t, StateObject, R, time } from './common';

/**
 * Handles keeping a set of Peers in sync.
 */
export function usePeerController(args: { bus: t.EventBus }) {
  const bus = args.bus.type<t.PeerEvent>();
  const $ = bus.event$;

  const [state, setState] = useState<t.ConversationState>();

  useEffect(() => {
    const model = StateObject.create<t.ConversationState>({});
    let peer: PeerJS;
    const connections: PeerJS.DataConnection[] = [];

    /**
     * Keep state in sync with model.
     */
    model.event.changed$.subscribe((e) => setState(e.to));

    const changeModel = (data: Partial<t.ConversationState>) => {
      bus.fire({ type: 'Peer/model', payload: { data } });
    };

    /**
     * Init
     */
    rx.payload<t.PeerCreatedEvent>($, 'Peer/created')
      .pipe()
      .subscribe((e) => {
        peer = e.peer;

        /**
         * INCOMING (Recieve)
         */
        peer.on('connection', (conn) => {
          conn.on('data', (data) => {
            if (typeof data === 'object') {
              changeModel(data);
            }
          });
        });
      });

    /**
     * Peer connected
     * Setup outgoing connection.
     */
    rx.payload<t.PeerConnectEvent>($, 'Peer/connect')
      .pipe(filter((e) => Boolean(peer)))
      .subscribe((e) => {
        const conn = peer.connect(e.id);
        conn.on('open', () => connections.push(conn));
      });

    /**
     * Listen for data publish events.
     */
    rx.payload<t.PeerPublishEvent>($, 'Peer/publish')
      .pipe(filter((e) => Boolean(peer)))
      .subscribe((e) => {
        connections.forEach((conn) => conn.send(e.data));
        changeModel(e.data);
      });

    /**
     * Update model with new state.
     */
    rx.payload<t.PeerModelEvent>($, 'Peer/model')
      .pipe(filter((e) => Boolean(peer)))
      .subscribe((e) => {
        const state = { ...model.state, ...e.data };
        if (!R.equals(state, model.state)) {
          model.change(state);
        }
      });
  }, []); // eslint-disable-line

  return { state };
}
