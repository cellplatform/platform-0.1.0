import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { Vimeo, VimeoProps } from './Vimeo';

export const VIDEOS = [
  { label: 'app/tubes', value: 499921561 },
  { label: 'stock/running', value: 287903693 }, // https://vimeo.com/stock/clip-287903693-silhouette-woman-running-on-beach-waves-splashing-female-athlete-runner-exercising-sprinting-intense-workout-on-rough-ocean-seas
];

type Ctx = { props: VimeoProps };

/**
 * Actions
 * https://github.com/vimeo/player.js
 */
export const actions = DevActions<Ctx>()
  .namespace('player.Vimeo')
  .context((prev) => {
    if (prev) return prev;

    return {
      props: {
        video: VIDEOS[1].value,
        controls: false,
        isPlaying: false,
        isLooping: false,
      },
    };
  })

  .items((e) => {
    e.title('load options');

    e.boolean('controls', (e) => {
      if (e.changing) e.ctx.props.controls = e.changing.next;
      e.boolean.current = e.ctx.props.controls;
    });

    e.button('width: 600', (e) => (e.ctx.props.width = 600));
    e.button('width: 800', (e) => (e.ctx.props.width = 800));

    e.hr();
  })

  .items((e) => {
    e.title('instance');

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

    e.boolean('isPlaying', (e) => {
      if (e.changing) e.ctx.props.isPlaying = e.changing.next;
      e.boolean.current = e.ctx.props.isPlaying;
    });

    e.boolean('isLooping', (e) => {
      if (e.changing) e.ctx.props.isLooping = e.changing.next;
      e.boolean.current = e.ctx.props.isLooping;
    });

    e.hr();
  })

  .items((e) => {
    e.title('skipTo');
    e.button('0 (start)', (e) => (e.ctx.props.skipTo = -10));
    e.button('15', (e) => (e.ctx.props.skipTo = 15));
    e.button('21', (e) => (e.ctx.props.skipTo = 21));
    e.button('9999', (e) => (e.ctx.props.skipTo = 9999));

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
        label: '<Vimeo>',
      },
      host: { background: -0.04, color: -1 },
    });

    e.render(
      <Vimeo
        {...e.ctx.props}
        onUpdate={(e) => {
          console.log('onUpdate', e);
        }}
      />,
    );
  });

export default actions;
