import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { css, rx, t, StateObject } from './common';
import { asArray } from '@platform/util.value';
import { Conversation, ConversationProps } from './Conversation';
import { stateController } from './Conversation.controller';

type B = t.EventBus<t.PeerEvent>;
type Ctx = {
  fire: B['fire'];
  props: ConversationProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus<t.PeerEvent>();
    const model = StateObject.create<t.ConversationState>({});
    stateController({ bus, model });

    return {
      fire: bus.fire,
      props: { bus, model },
    };
  })

  .items((e) => {
    e.title('Experiment 0.3.1');

    e.button('load diagrams', (e) => {
      const imageDir = 'static/images.tmp/peer-4/';
      e.ctx.fire({ type: 'Peer/publish', payload: { data: { imageDir } } });
    });
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    const state = e.ctx.props.model.state;

    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: {
          topLeft: 'Conversation.Layout',
          topRight: `folder: ${asArray(state.imageDir).join(', ') || '<none>'}`,
        },
        position: [80, 80, 120, 80],
      },
      host: { background: -0.04 },
    });

    const el = (
      <div {...css({ Absolute: 0, overflow: 'hidden', display: 'flex' })}>
        <Conversation {...e.ctx.props} />
      </div>
    );

    e.render(el);
  });

export default actions;
