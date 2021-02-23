import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Layout, LayoutProps } from './Layout';
import { css } from '../../common';
import { asArray } from '@platform/util.value';

type Ctx = { props: LayoutProps };

const DIRS = {
  PEER1: 'static/images.tmp/peer-1/',
  PEER2: 'static/images.tmp/peer-2/',
  PEER3: 'static/images.tmp/peer-3/',
};

const INITIAL: Ctx = { props: { imageDir: DIRS.PEER3 } };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation')
  .context((prev) => prev || INITIAL)

  .items((e) => {
    e.title('Actions');

    e.button('add peer', (e) => {
      e.ctx.props.totalPeers = (e.ctx.props.totalPeers || 0) + 1;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Folder (Content)');
    e.button('dir-1', (e) => (e.ctx.props.imageDir = DIRS.PEER1));
    e.button('dir-2', (e) => (e.ctx.props.imageDir = DIRS.PEER2));
    e.button('dir-3', (e) => (e.ctx.props.imageDir = DIRS.PEER3));
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    const imageDirs = asArray(e.ctx.props.imageDir).filter(Boolean);

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
      <div {...css({ overflow: 'hidden', flex: 1, display: 'flex' })}>
        <Layout {...e.ctx.props} />
      </div>
    );

    e.render(el);
  });

export default actions;
