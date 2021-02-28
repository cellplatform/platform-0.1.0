import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Peer, PeerProps } from '.';
import { cuid, rx, createPeer } from '../common';

const bus = rx.bus();

type Ctx = { self: string; props: PeerProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation.Peer')
  .context((prev) => {
    const self = cuid();
    return (
      prev || {
        self,
        props: { bus, peer: createPeer({ bus, id: self }) },
      }
    );
  })

  .items((e) => {
    e.title('props');

    e.boolean('isSelf', (e) => {
      if (e.changing) e.ctx.props.isSelf = e.changing.next;
    });
    e.boolean('isCircle', (e) => {
      if (e.changing) e.ctx.props.isCircle = e.changing.next;
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        // border: -0.1,
        cropmarks: -0.2,
        // background: 1,
        label: '<Sample>',
        // width: 300,
        // height: 200,
        // position: [150, 80],
      },
      host: { background: -0.04 },
    });
    e.render(<Peer {...e.ctx.props} />);
  });

export default actions;
