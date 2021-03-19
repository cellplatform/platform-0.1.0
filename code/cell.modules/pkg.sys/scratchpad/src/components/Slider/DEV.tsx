import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Slider, SliderProps } from '.';

type Ctx = { props: SliderProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.primitives/Slider')
  .context((prev) => {
    if (prev) return prev;
    return { props: {} };
  })

  .items((e) => {
    //
    e.title('Slider');

    e.button('foo', (e) => {
      //
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Slider>',
        // position: [150, 80],
        width: 300,
        // border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Slider {...e.ctx.props} />);
  });

export default actions;
