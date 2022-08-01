import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Spinner, SpinnerProps } from '..';
import { COLORS } from '../common';

type Ctx = { props: SpinnerProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Spinner')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        size: Spinner.DEFAULT.size,
        color: COLORS.DARK,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('size')
        .items(Spinner.DEFAULT.sizes)
        .initial(config.ctx.props.size)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.size = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .title('color')
        .items([
          { label: '<undefined>', value: undefined },
          { label: 'Dark', value: COLORS.DARK },
          { label: 'White', value: COLORS.WHITE },
        ])
        .initial(config.ctx.props.color)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.color = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const isWhite = e.ctx.props.color === COLORS.WHITE;

    e.settings({
      actions: { width: 300 },
      host: { background: isWhite ? COLORS.DARK : -0.04 },
      layout: {
        cropmarks: isWhite ? 0.3 : -0.2,
        labelColor: isWhite ? 0.5 : -0.2,
      },
    });

    e.render(<Spinner {...e.ctx.props} />);
  });

export default actions;
