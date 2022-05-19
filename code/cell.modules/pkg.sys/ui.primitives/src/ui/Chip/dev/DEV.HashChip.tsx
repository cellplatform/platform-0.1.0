import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Chip, HashChipProps } from '..';
import { COLORS } from '../../common';

type Ctx = { props: HashChipProps };

const SHA256 = 'sha256-8ca00241ed17dd01c8248432c4816445127c1905cf244fe34abbbb5c8b0e9d04';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.HashChip')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        text: SHA256,
        clipboard: true,
        inline: true,
        icon: true,
        theme: Chip.DEFAULT.THEME,
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('HashChip');

    e.select((config) => {
      config
        .view('buttons')
        .title('theme')
        .items(Chip.Hash.THEMES)
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.boolean('clipboard', (e) => {
      if (e.changing) e.ctx.props.clipboard = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.clipboard);
    });

    e.boolean('inline', (e) => {
      if (e.changing) e.ctx.props.inline = e.changing.next;
      e.boolean.current = e.ctx.props.inline;
    });

    e.boolean('icon', (e) => {
      if (e.changing) e.ctx.props.icon = e.changing.next;
      e.boolean.current = e.ctx.props.icon;
    });

    e.boolean('prefix', (e) => {
      if (e.changing) e.ctx.props.prefix = e.changing.next ? undefined : null;
      e.boolean.current = e.ctx.props.prefix === undefined;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Text');

    e.button('hash: prefix', (e) => (e.ctx.props.text = SHA256));
    e.button('hash: no prefix', (e) => (e.ctx.props.text = SHA256.split('-')[1]));
    e.button('(undefined)', (e) => (e.ctx.props.text = undefined));

    e.hr();
  })

  .items((e) => {
    e.title('Prefix Color');

    e.button('default (undefined)', (e) => (e.ctx.props.prefixColor = undefined));
    e.button('magenta', (e) => (e.ctx.props.prefixColor = COLORS.MAGENTA));
    e.button('-0.3', (e) => (e.ctx.props.prefixColor = -0.3));

    e.hr();
  })

  .items((e) => {
    e.title('Hash Length');

    e.button('4', (e) => (e.ctx.props.length = 4));
    e.button('6 (default)', (e) => (e.ctx.props.length = 6));
    e.button('8', (e) => (e.ctx.props.length = 8));
    e.button('20', (e) => (e.ctx.props.length = 20));
    e.button('long', (e) => (e.ctx.props.length = 5000));

    e.hr();
  })

  .subject((e) => {
    const isLight = e.ctx.props.theme === 'Light';

    e.settings({
      host: { background: isLight ? -0.04 : COLORS.DARK },
      layout: {
        cropmarks: isLight ? -0.2 : 0.2,
        labelColor: isLight ? -0.5 : 0.8,
      },
    });

    e.render(<Chip.Hash {...e.ctx.props} />);
  });

export default actions;
