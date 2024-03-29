import React from 'react';
import { ActionHandlerArgs, DevActions } from 'sys.ui.dev';

import { VimeoBackground, VimeoBackgroundProps } from '..';
import { COLORS, rx, t, slug } from '../common';
import { VIDEOS } from './Vimeo.DEV';

type Ctx = {
  bus: t.EventBus<t.VimeoEvent>;
  events: t.VimeoEvents;
  props: VimeoBackgroundProps;
};
type A = ActionHandlerArgs<Ctx>;

/**
 * Actions
 * https://github.com/vimeo/player.js
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.video.VimeoBackground')
  .context((e) => {
    if (e.prev) return e.prev;

    const id = `foo.${slug()}`;
    const bus = rx.bus<t.VimeoEvent>();
    const instance = { bus, id };

    const events = VimeoBackground.Events({ instance });

    bus.$.subscribe((e) => {
      console.log(e.type, e.payload);
    });

    return {
      bus,
      events,
      props: {
        instance,
        video: VIDEOS[0].value,
        blur: 0,
        opacity: 1,
        opacityTransition: 300,
      },
    };
  })

  .items((e) => {
    e.title('display presets');

    e.select((config) => {
      config
        .label(`videos`)
        .items(VIDEOS)
        .initial(VIDEOS[0])
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

  .items((e) => {
    e.title('start/stop');
    e.button('play ("start")', (e) => e.ctx.events.play.fire());
    e.button('pause ("stop")', (e) => e.ctx.events.pause.fire());
    e.hr(1, 0.1);
  })

  .items((e) => {
    const fire = (e: A, seconds: number) => {
      const instance = e.ctx.props.instance.id;
      e.ctx.bus.fire({ type: 'Vimeo/seek:req', payload: { instance, seconds } });
    };
    e.title('seek');
    e.button('0 (start)', (e) => fire(e, -10));
    e.button('5', (e) => fire(e, 5));
    e.button('10', (e) => fire(e, 10));
    e.button('9999', (e) => fire(e, 9999));

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        label: '<VimeoBackground>',
        border: 0.2,
        cropmarks: 0.4,
        labelColor: 0.4,
        position: [200, 80],
      },
      host: { background: COLORS.DARK, color: -1 },
    });

    e.render(<VimeoBackground {...e.ctx.props} />);
  });

export default actions;
