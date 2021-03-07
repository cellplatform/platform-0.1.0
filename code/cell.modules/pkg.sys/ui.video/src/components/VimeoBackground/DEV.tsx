import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { COLORS } from '../../common';
import { VIDEOS } from '../Vimeo/DEV';
import { VimeoBackground, VimeoBackgroundProps } from './VimeoBackground';

type Ctx = {
  props: VimeoBackgroundProps;
};

const INITIAL_VIDEO = VIDEOS[0];
const initial: Ctx = {
  props: { video: INITIAL_VIDEO.value, blur: 0, opacity: 1, opacityTransition: 300 },
};

/**
 * Actions
 * https://github.com/vimeo/player.js
 */
export const actions = DevActions<Ctx>()
  .namespace('player.VimeoBackground')
  .context((prev) => prev || initial)

  .items((e) => {
    //

    /**
     * Options
     */
    e.title('display presets');

    e.select((config) => {
      config
        .label(`videos`)
        .items(VIDEOS)
        .initial(INITIAL_VIDEO)
        .pipe((e) => {
          const { ctx, select } = e;
          const current = select.current[0]; // NB: always first.
          select.label = current ? `video: ${current.label}` : `video`;
          select.isPlaceholder = !Boolean(current);
          ctx.props.video = current ? current.value : undefined;
        });
    });

    e.boolean('blur', (e) => {
      if (e.changing) e.ctx.props.blur = e.changing.next ? 10 : 0;
      e.boolean.current = e.ctx.props.blur !== 0;
      e.boolean.label = `blur: ${e.ctx.props.blur}px`;
    });

    e.boolean('opacity', (e) => {
      if (e.changing) e.ctx.props.opacity = e.ctx.props.opacity === 1 ? 0.3 : 1;
      e.boolean.current = e.ctx.props.opacity === 1;
      e.boolean.label = `opacity: ${e.ctx.props.opacity}`;
    });

    e.select((config) => {
      config
        .label('opacityTransition')
        .items([
          { label: 'fast (default)', value: 300 },
          { label: 'slow', value: 1200 },
        ])
        .pipe((e) => {
          const { ctx, select } = e;
          const current = select.current[0]; // NB: always first.
          select.label = current ? `opacityTransition: ${current.value}ms` : `opacityTransition`;
          ctx.props.opacityTransition = current ? current.value : undefined;
        });
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: 0.2,
        cropmarks: 0.4,
        label: '<Vimeo>',
        labelColor: 0.4,
        position: [200, 80],
      },
      host: { background: COLORS.DARK, color: -1 },
    });

    e.render(<VimeoBackground {...e.ctx.props} />);
  });

export default actions;
