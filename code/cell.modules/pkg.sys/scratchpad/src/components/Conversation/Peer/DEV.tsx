import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Peer, PeerProps } from '.';
import { cuid, rx, createPeer, PeerJS, t } from '../common';

type Ctx = { self: string; props: PeerProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation.Peer')
  .context((e) => {
    if (e.prev) return e.prev;

    const self = cuid();
    let peer: PeerJS;
    const bus = rx.bus<t.ConversationEvent>();

    return {
      self,
      props: {
        bus,
        get peer() {
          // NB: Lazily loaded to avoid needless calls
          //     to the peering server when these actions are not loaded.
          if (!peer) peer = createPeer({ bus });
          return peer;
        },
      },
    };
  })

  .items((e) => {
    e.title('props');

    e.boolean('isSelf', (e) => {
      if (e.changing) e.ctx.props.isSelf = e.changing.next;
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        cropmarks: -0.2,
        label: '<Peer>',
      },
      host: { background: -0.04 },
    });
    e.render(<Peer {...e.ctx.props} />);
  });

export default actions;
