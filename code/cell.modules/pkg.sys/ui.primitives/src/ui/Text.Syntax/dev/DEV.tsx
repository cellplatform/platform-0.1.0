import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { TextSyntax, TextSyntaxProps } from '..';
import { css, COLORS } from '../common';

type Ctx = {
  props: TextSyntaxProps;
  debug: { repeat: number; monospace: boolean; customColors: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Text.Syntax')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        text: 'hello, <Component>...',
        inlineBlock: true,
        theme: 'Light',
      },
      debug: { repeat: 1, monospace: true, customColors: false },
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

    e.select((config) => {
      config
        .view('buttons')
        .title('theme')
        .items(TextSyntax.constants.THEMES)
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Text');

    const add = (text: string, value = text) => {
      e.button(text, (e) => (e.ctx.props.text = value));
    };

    add('"" (empty)', '');
    add('my plain text');
    add('<Component>');
    add('{Object}');
    add('[List]');
    add('foo:bar');
    add('{One} <Two> foo:bar [List]');

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

    e.boolean('monospace', (e) => {
      if (e.changing) e.ctx.debug.monospace = e.changing.next;
      e.boolean.current = e.ctx.debug.monospace;
    });

    e.boolean('customColors', (e) => {
      if (e.changing) e.ctx.debug.customColors = e.changing.next;
      e.boolean.current = e.ctx.debug.customColors;
    });

    e.hr();
  })

  .subject((e) => {
    const { props, debug } = e.ctx;
    const { inlineBlock } = props;
    const { repeat, monospace, customColors } = debug;

    const theme = props.theme ?? TextSyntax.constants.DEFAULT.THEME;
    const isLight = theme === 'Light';

    e.settings({
      host: { background: isLight ? -0.04 : COLORS.DARK },
      layout: {
        cropmarks: isLight ? -0.2 : 0.6,
        labelColor: isLight ? -0.5 : 0.8,
      },
    });

    const styles = {
      base: css({
        fontFamily: monospace ? 'monospace' : 'sans-serif',
        fontWeight: monospace ? 'bold' : 'normal',
        fontSize: 16,
      }),
      multi: css({
        marginRight: inlineBlock ? 8 : 0,
        ':last-child': { marginRight: 0 },
      }),
    };

    const elements = Array.from({ length: repeat }).map((v, i) => {
      const style = css(styles.base, repeat > 1 ? styles.multi : undefined);
      const colors = customColors ? { Brace: 'orange' } : undefined;
      return <TextSyntax key={i} {...props} colors={colors} style={style} />;
    });

    e.render(<div>{elements}</div>);
  });

export default actions;
