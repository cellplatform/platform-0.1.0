import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Layout, LayoutProps } from './Layout';
import { css, cuid } from '../../common';

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
      e.ctx.props.peers = (e.ctx.props.peers || 0) + 1;
    });

    // e.boolean('muted', (e) => {
    //   if (e.changing) e.ctx.props.isMuted = e.changing.next;
    //   e.boolean.current = Boolean(e.ctx.props.isMuted);
    // });
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: 'Conversation.Layout',
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
