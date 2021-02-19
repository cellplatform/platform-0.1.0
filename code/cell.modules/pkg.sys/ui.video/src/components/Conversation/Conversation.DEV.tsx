import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Layout, LayoutProps } from './Layout';
import { css } from '../../common';
import { asArray } from '@platform/util.value';

type Ctx = { props: LayoutProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation')
  .context((prev) => prev || { props: {} })

  .items((e) => {
    e.title('Actions');

    e.button('add peer', (e) => {
      //
      e.ctx.props.totalPeers = (e.ctx.props.totalPeers || 0) + 1;
    });

    // e.boolean('muted', (e) => {
    //   if (e.changing) e.ctx.props.isMuted = e.changing.next;
    //   e.boolean.current = Boolean(e.ctx.props.isMuted);
    // });
    e.hr();
  })

  .items((e) => {
    e.title('Folder (Content)');
    e.button('peer-1', (e) => (e.ctx.props.imageDir = 'static/images.tmp.peer-1/'));
    e.button('peer-2', (e) => (e.ctx.props.imageDir = 'static/images.tmp.peer-2/'));
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
