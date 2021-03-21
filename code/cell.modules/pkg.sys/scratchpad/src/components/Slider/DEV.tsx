import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Slider, SliderProps } from '.';
import { color, css, CssValue, t } from '../../common';
import { SampleThumb } from './DEV.components';

type Ctx = { props: SliderProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.primitives/Slider')
  .context((prev) => {
    if (prev) return prev;
    return {
      props: {},
    };
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
        width: 300,
        cropmarks: -0.2,
      },
    });

    const elThumb = <SampleThumb x={0} />;

    e.render(<Slider {...e.ctx.props} thumb={elThumb} />);
  });

export default actions;
