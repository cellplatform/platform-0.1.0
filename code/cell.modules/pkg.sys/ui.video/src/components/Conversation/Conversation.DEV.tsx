import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { css, rx, t } from './common';
import { asArray } from '@platform/util.value';
import { Conversation, ConversationProps } from './Conversation';

type Ctx = { props: ConversationProps };

const bus = rx.bus();
const fire = bus.type<t.PeerEvent>().fire;

const DIRS = {
  PEER1: 'static/images.tmp/peer-1/',
  PEER2: 'static/images.tmp/peer-2/',
  PEER3: 'static/images.tmp/peer-3/',
};

const INITIAL: Ctx = { props: { bus } };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation')
  .context((prev) => prev || INITIAL)

  .items((e) => {
    e.title('Actions');

    // e.button('add peer', (e) => {
    //   // e.ctx.props.totalPeers = (e.ctx.props.totalPeers || 0) + 1;
    // });

    e.hr();
  })

  .items((e) => {
    e.title('Folder (Content)');
    // e.button('dir-1', (e) => (e.ctx.props.imageDir = DIRS.PEER1));
    // e.button('dir-2', (e) => (e.ctx.props.imageDir = DIRS.PEER2));
    // e.button('dir-3', (e) => (e.ctx.props.imageDir = DIRS.PEER3));

    e.button('e-1', (e) => {
      const data = { imageDir: DIRS.PEER3 };
      fire({ type: 'Peer/publish', payload: { data } });
      // fire({ type: 'Peer/model', payload: { data } });
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    // const imageDirs = asArray(e.ctx.props.imageDir).filter(Boolean);
    const imageDirs: string[] = [];

    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: {
          topLeft: 'Conversation.Layout',
          topRight: `folder: ${imageDirs.join(', ') || '<none>'}`,
        },
        position: [80, 80, 120, 80],
      },
      host: { background: -0.04 },
    });

    const el = (
      <div {...css({ overflow: 'hidden', Absolute: 0, display: 'flex' })}>
        <Conversation {...e.ctx.props} />
      </div>
    );

    e.render(el);
  });

export default actions;
