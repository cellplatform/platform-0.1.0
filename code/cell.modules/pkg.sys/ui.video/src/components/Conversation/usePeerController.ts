import React, { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs/operators';

import { PeerJS, rx, t } from './common';

/**
 * Handles keeping a set of Peers in sync.
 */
export function usePeerController(args: { bus: t.EventBus }) {
  const bus = args.bus.type<t.PeerEvent>();
  const $ = bus.event$;

  useEffect(() => {
    let peer: PeerJS;
    const connections: PeerJS.DataConnection[] = [];

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
            //
            console.group('🌳 RECIEVE PEER:', peer.id);
            console.log('incoming', data);
            console.groupEnd();
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
      });
  }, []); // eslint-disable-line
}
