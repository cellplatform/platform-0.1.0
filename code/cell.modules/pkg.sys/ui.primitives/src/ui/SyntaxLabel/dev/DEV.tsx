import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { SyntaxLabel, SyntaxLabelProps } from '..';
import { css } from '../../common';

type Ctx = {
  props: SyntaxLabelProps;
  debug: { repeat: number; monospace: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.SyntaxLabel')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        text: '<Component>',
        inlineBlock: true,
      },
      debug: { repeat: 1, monospace: true },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('<SyntaxLabel>');

    e.boolean('inlineBlock', (e) => {
      if (e.changing) e.ctx.props.inlineBlock = e.changing.next;
      e.boolean.current = e.ctx.props.inlineBlock;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Text');

    e.button('empty', (e) => (e.ctx.props.text = undefined));
    e.button('<Component>', (e) => (e.ctx.props.text = '<Component>'));
    e.button('{Object}', (e) => (e.ctx.props.text = '{Object}'));
    e.button('{One} <Two>', (e) => (e.ctx.props.text = '{One} <Two>'));
    e.button('"my text"', (e) => (e.ctx.props.text = 'my text'));

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.select((config) => {
      config
        .view('buttons')
        .title('repeat')
        .items([1, 2, 3])
        .initial(config.ctx.debug.repeat)
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.debug.repeat = current.value;
        });
    });

    e.boolean('monospace', (e) => {
      if (e.changing) e.ctx.debug.monospace = e.changing.next;
      e.boolean.current = e.ctx.debug.monospace;
    });

    e.hr();
  })

  .subject((e) => {
    const { repeat, monospace } = e.ctx.debug;

    e.settings({
      host: { background: -0.04 },
      layout: {
        border: -0.1,
        cropmarks: -0.2,
      },
    });

    const styles = {
      base: css({
        fontFamily: monospace ? 'monospace' : 'sans-serif',
        fontWeight: monospace ? 'bold' : 'normal',
        fontSize: 16,
      }),
      multi: css({
        marginRight: 8,
        ':last-child': { marginRight: 0 },
      }),
    };

    if (repeat === 1) e.render(<SyntaxLabel {...e.ctx.props} style={styles.base} />);
    if (repeat > 1) {
      const elements = Array.from({ length: repeat }).map((v, i) => {
        return <SyntaxLabel key={i} {...e.ctx.props} style={css(styles.base, styles.multi)} />;
      });

      e.render(<div>{elements}</div>);
    }
  });

export default actions;