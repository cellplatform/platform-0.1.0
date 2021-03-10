import React from 'react';
import { DevActions, ActionHandlerArgs } from 'sys.ui.dev';

import { Vimeo, VimeoProps } from './Vimeo';
import { rx, t } from '../../common';
import * as types from './types';

export const VIDEOS = [
  { label: 'app/tubes', value: 499921561 },
  { label: 'stock/running', value: 287903693 }, // https://vimeo.com/stock/clip-287903693-silhouette-woman-running-on-beach-waves-splashing-female-athlete-runner-exercising-sprinting-intense-workout-on-rough-ocean-seas
];

type Ctx = { bus: t.EventBus<types.VimeoEvent>; props: VimeoProps };
type A = ActionHandlerArgs<Ctx>;

const id = 'sample';

/**
 * Actions
 * https://github.com/vimeo/player.js
 */
export const actions = DevActions<Ctx>()
  .namespace('player.Vimeo')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus<types.VimeoEvent>();

    bus.event$.pipe().subscribe((e) => {
      console.log(e.type, e.payload);
    });

    return {
      bus,
      props: {
        id,
        bus,
        video: VIDEOS[1].value,
        controls: false,
        autoPlay: true,
        loop: false,
      },
    };
  })

  .items((e) => {
    e.title('options (reload)');

    e.boolean('controls', (e) => {
      if (e.changing) e.ctx.props.controls = e.changing.next;
      e.boolean.current = e.ctx.props.controls;
    });

    e.button('width: 600', (e) => (e.ctx.props.width = 600));
    e.button('width: 800', (e) => (e.ctx.props.width = 800));

    e.hr();
  })

  .items((e) => {
    e.title('props');

    e.boolean('autoPlay', (e) => {
      if (e.changing) e.ctx.props.autoPlay = e.changing.next;
      e.boolean.current = e.ctx.props.autoPlay;
    });

    e.boolean('loop', (e) => {
      if (e.changing) e.ctx.props.loop = e.changing.next;
      e.boolean.current = e.ctx.props.loop;
    });

    e.select((config) => {
      config
        .label(`videos`)
        .items(VIDEOS)
        .initial(VIDEOS[1])
        .pipe((e) => {
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? `video: ${current.label}` : `video`;
          e.select.isPlaceholder = !Boolean(current);
          e.ctx.props.video = current ? current.value : undefined;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('video');
    e.button('play (start)', (e) => e.ctx.bus.fire({ type: 'Vimeo/play', payload: { id } }));
    e.button('pause (stop)', (e) => e.ctx.bus.fire({ type: 'Vimeo/pause', payload: { id } }));
    e.hr(1, 0.1);
  })

  .items((e) => {
    const fire = (e: A, seconds: number) => {
      e.ctx.bus.fire({ type: 'Vimeo/seek', payload: { id, seconds } });
    };
    e.title('seek');
    e.button('0 (start)', (e) => fire(e, -10));
    e.button('15', (e) => fire(e, 15));
    e.button('20', (e) => fire(e, 20));
    e.button('9999', (e) => fire(e, 9999));
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: { border: -0.1, cropmarks: -0.2, label: '<Vimeo>' },
      host: { background: -0.04, color: -1 },
    });

    e.render(<Vimeo {...e.ctx.props} />);
  });

export default actions;
