import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { TextCopy, TextCopyProps } from '..';
import { css } from '../../common';

type Ctx = {
  props: TextCopyProps;
  debug: {
    text: string;
    repeat: number;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Text.Copy')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {},
      debug: { text: 'my text', repeat: 1 },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    ctx.props.copyToClipboard = (e) => e.copy('foobar');
  })

  .items((e) => {
    e.title('Text');
    e.button('empty', (e) => (e.ctx.debug.text = ''));
    e.button('<Component>', (e) => (e.ctx.debug.text = '<Component>'));
    e.button('{Object}', (e) => (e.ctx.debug.text = '{Object}'));
    e.button('{One} <Two>', (e) => (e.ctx.debug.text = '{One} <Two>'));
    e.button('"my text"', (e) => (e.ctx.debug.text = 'my text'));
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
          if (e.changing) e.ctx.debug.repeat = e.changing?.next[0].value;
        });
    });

    e.hr();

    e.component((e) => {
      return <ObjectView name={'props'} data={e.ctx.props} style={{ MarginX: 15 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    const props = e.ctx.props;
    const { inlineBlock } = props;
    const { repeat } = e.ctx.debug;

    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    const styles = {
      base: css({}),
      multi: css({
        marginRight: inlineBlock ? 8 : 0,
        ':last-child': { marginRight: 0 },
      }),
    };

    const text = e.ctx.debug.text;

    if (repeat === 1)
      e.render(
        <TextCopy {...props} style={styles.base}>
          {text}
        </TextCopy>,
      );
    if (repeat > 1) {
      const length = repeat;
      const elements = Array.from({ length }).map((v, i) => {
        const style = css(styles.base, styles.multi);
        return (
          <TextCopy key={i} {...props} style={style}>
            {text}
          </TextCopy>
        );
      });

      e.render(<div>{elements}</div>);
    }
  });

export default actions;
