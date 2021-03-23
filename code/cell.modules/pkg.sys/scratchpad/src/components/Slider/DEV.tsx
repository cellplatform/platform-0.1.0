import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Slider, SliderProps } from '.';
import { color, css, CssValue, t } from '../../common';
import { SampleThumb } from './DEV.components';

type Ctx = { props: SliderProps };

const orientations = [
  { label: 'orientation: x', value: 'x' },
  { label: 'orientation: y', value: 'y' },
];

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.primitives/Slider')
  .context((prev) => {
    if (prev) return prev;
    return {
      props: { orientation: 'x' },
    };
  })

  .items((e) => {
    e.title('Slider');

    e.select((config) => {
      config
        .view('buttons')
        .items(orientations)
        .initial(orientations[0])
        .pipe((e) => {
          if (e.changing) e.ctx.props.orientation = e.changing.next[0].value;
        });
    });

    e.hr();
  })

  .subject((e) => {
    const { orientation } = e.ctx.props;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Slider>',
        width: orientation === 'x' ? 300 : 30,
        height: orientation === 'y' ? 300 : 30,
        cropmarks: -0.2,
      },
    });

    const elThumb = <SampleThumb x={0} />;

    e.render(<Slider {...e.ctx.props} thumb={elThumb} style={{ flex: 1 }} />);
  });

export default actions;
