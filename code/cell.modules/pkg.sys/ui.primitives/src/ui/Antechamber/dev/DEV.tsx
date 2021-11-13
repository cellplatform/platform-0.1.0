import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { AntechamberProps } from '..';
import { t } from '../../common';
import { Sample } from './DEV.samples';

type Ctx = {
  props: AntechamberProps;
  size?: t.DomRect;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.Antechamber')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        isOpen: false,
        isSpinning: false,
        backgroundBlur: 10,
        slideDuration: 300,
        onSize: (size) => e.change.ctx((ctx) => (ctx.size = size)),
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('isOpen', (e) => {
      if (e.changing) e.ctx.props.isOpen = e.changing.next;
      e.boolean.current = e.ctx.props.isOpen;
    });

    e.boolean('isSpinning', (e) => {
      if (e.changing) e.ctx.props.isSpinning = e.changing.next;
      e.boolean.current = e.ctx.props.isSpinning;
    });

    e.hr(1, 0.1);

    e.button('seal: hide', (e) => {
      e.ctx.props.sealOpacity = 0;
      e.ctx.props.sealRotate = 35;
    });

    e.button('seal: show', (e) => {
      e.ctx.props.sealOpacity = 1;
      e.ctx.props.sealRotate = 0;
    });

    e.hr(1, 0.1);

    e.select((config) =>
      config
        .view('buttons')
        .label('slideDuration (ms)')
        .items([100, 200, 300, 500, 1200])
        .initial(config.ctx.props.slideDuration)
        .pipe((e) => {
          if (e.changing) e.ctx.props.slideDuration = e.changing.next[0].value;
        }),
    );

    e.hr();
  })

  .subject((e) => {
    const size = e.ctx.size;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Antechamber>',
          topRight: size && `${size.width} x ${size.height} px`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<Sample {...e.ctx.props} style={{ Absolute: 0 }} />);
  });

export default actions;
