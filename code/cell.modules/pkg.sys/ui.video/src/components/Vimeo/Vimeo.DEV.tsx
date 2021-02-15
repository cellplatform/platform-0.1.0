import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { Vimeo, VimeoProps } from './Vimeo';

export const VIDEOS = [
  { label: 'app/tubes', value: 499921561 },
  { label: 'stock/running', value: 287903693 }, // https://vimeo.com/stock/clip-287903693-silhouette-woman-running-on-beach-waves-splashing-female-athlete-runner-exercising-sprinting-intense-workout-on-rough-ocean-seas
];

type Ctx = {
  props: VimeoProps;
};

const initial: Ctx = {
  props: { video: VIDEOS[1].value, controls: false },
};

/**
 * Actions
 * https://github.com/vimeo/player.js
 */
export const actions = DevActions<Ctx>()
  .namespace('components/Vimeo')
  .context((prev) => prev || initial)

  .items((e) => {
    e.title('load options');

    e.select((config) => {
      config
        .label(`videos`)
        .items(VIDEOS)
        .initial(VIDEOS[1])
        .pipe((e) => {
          const { ctx, select } = e;
          const current = select.current[0]; // NB: always first.
          select.label = current ? `video: ${current.label}` : `video`;
          select.isPlaceholder = !Boolean(current);
          ctx.props.video = current ? current.value : undefined;
        });
    });

    e.boolean('controls', (e) => {
      if (e.changing) e.ctx.props.controls = e.changing.next;
      e.boolean.current = e.ctx.props.controls;
    });

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

    e.render(<Vimeo {...e.ctx.props} />);
  });

export default actions;
