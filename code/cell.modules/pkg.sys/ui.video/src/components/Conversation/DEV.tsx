import { asArray } from '@platform/util.value';
import React from 'react';
import { ActionButtonHandlerArgs, DevActions } from 'sys.ui.dev';

import { css, rx, StateObject, t, WebRuntime } from './common';
import { Conversation, ConversationProps } from './Conversation';
import { stateController } from './Conversation.controller';

type O = Record<string, unknown>;
type B = t.EventBus<t.ConversationEvent>;
type Ctx = {
  fire: B['fire'];
  props: ConversationProps;
};
type E = ActionButtonHandlerArgs<Ctx>;

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace(`Conversation`)
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus<t.ConversationEvent>();
    const model = StateObject.create<t.ConversationState>({ peers: {} });
    stateController({ bus, model });

    const ctx: Ctx = {
      fire: bus.fire,
      props: { bus, model },
    };

    return ctx;
  })

  .items((e) => {
    e.title(`Conversation - v${WebRuntime.module.version || '0.0.0'}`);

    e.boolean('blur', (e) => {
      if (e.changing) e.ctx.props.blur = e.changing.next ? 8 : 0;
      return e.ctx.props.blur !== 0;
    });
    e.hr();

    e.button('log: model', (e) => console.log('model', e.ctx.props.model.state));
    e.button('log: peers', (e) => {
      const peers = e.ctx.props.model.state.peers;
      console.group('🌳 peers');
      Object.keys(peers).forEach((key) => {
        const peer = peers[key];
        console.log(peer.isSelf ? 'self' : 'peer', peer);
      });
      console.groupEnd();
    });
    e.hr();
  })

  .items((e) => {
    e.title('Body Component');

    e.button('distributed <Diagram>', (e) => {
      e.ctx.fire({
        type: 'Conversation/publish',
        payload: { kind: 'model', data: { remote: undefined } },
      });
    });

    e.button('install: <App>', (e) => {
      const remote = {
        url: 'https://dev.db.team/cell:cklrm37vp000el8et0cw7gaft:A1/fs/sample/remoteEntry.js',
        namespace: 'tdb.slc',
        entry: './App',
        props: { style: { Absolute: [15, 30] } },
      };
      e.ctx.fire({
        type: 'Conversation/publish',
        payload: { kind: 'model', data: { remote } },
      });
    });
    // e.button('cloud: canvas', (e) => {
    //   const remote = {
    //     url: 'https://dev.db.team/cell:cklrm37vp000el8et0cw7gaft:A1/fs/sample/remoteEntry.js',
    //     namespace: 'tdb.slc',
    //     entry: './MiniCanvasMouse',
    //     props: { theme: 'light', selected: 'purpose' },
    //   };
    //   e.ctx.fire({
    //     type: 'Conversation/publish',
    //     payload: { kind: 'model', data: { remote } },
    //   });
    // });

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
        position: [35, 35, 90, 35],
        label: {
          topLeft: 'Conversation.Layout',
          topRight: `folder: ${asArray(state.imageDir).join(', ') || '<none>'}`,
        },
      },
      host: { background: -0.04 },
      actions: { width: 230 },
    });

    const styles = {
      base: css({
        Absolute: 0,
        overflow: 'hidden',
        display: 'flex',
      }),
    };

    const el = (
      <div {...styles.base}>
        <Conversation {...e.ctx.props} />
      </div>
    );

    e.render(el);
  });

export default actions;
