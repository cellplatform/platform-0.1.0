import React from 'react';
import { DevActions, ActionHandlerArgs } from 'sys.ui.dev';

import { Vimeo, VimeoProps } from './Vimeo';
import { rx, t, COLORS } from '../../common';
import * as types from './types';

export const VIDEOS = [
  { label: 'app/tubes', value: 499921561 },
  { label: 'stock/running', value: 287903693 }, // https://vimeo.com/stock/clip-287903693-silhouette-woman-running-on-beach-waves-splashing-female-athlete-runner-exercising-sprinting-intense-workout-on-rough-ocean-seas
];

type Ctx = {
  theme: 'light' | 'dark';
  bus: t.EventBus<types.VimeoEvent>;
  props: VimeoProps;
};
type A = ActionHandlerArgs<Ctx>;

const id = 'sample';

/**
 * Actions
 * https://github.com/vimeo/player.js
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.video/Vimeo')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus<types.VimeoEvent>();

    bus.event$.pipe().subscribe((e) => {
      console.log(e.type, e.payload);
    });

    return {
      bus,
      theme: 'light',
      props: {
        id,
        bus,
        video: VIDEOS[1].value,
        controls: false,
        autoPlay: false,
        loop: true,
        borderRadius: 20,
      },
    };
  })

  .items((e) => {
    e.title('options (reload)');
    e.button('width: 600', (e) => (e.ctx.props.width = 600));
    e.button('width: 800', (e) => (e.ctx.props.width = 800));
    e.hr(1, 0.1);
  })

  .items((e) => {
    e.title('theme');
    e.button('light', (e) => (e.ctx.theme = 'light'));
    e.button('dark', (e) => (e.ctx.theme = 'dark'));
    e.hr(1, 0.1);
  })

  .items((e) => {
    e.title('props');

    e.boolean('borderRadius', (e) => {
      if (e.changing) e.ctx.props.borderRadius = e.changing.next ? 20 : undefined;
      e.boolean.current = e.ctx.props.borderRadius !== undefined;
    });

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
    const props = e.ctx.props;
    const theme = e.ctx.theme;

    const label = '<Vimeo';
    const size = { width: props.width, height: props.height };

    e.settings(
      theme === 'light'
        ? {
            layout: { label, cropmarks: -0.2, ...size },
            host: { background: -0.04 },
          }
        : {
            layout: { label, labelColor: 0.6, cropmarks: 0.4, ...size },
            host: { background: COLORS.DARK },
          },
    );

    e.render(<Vimeo {...props} />);
  });

export default actions;
