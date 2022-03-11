import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CommandTextbox, CommandTextboxProps, OpenConnectionInputConstants } from '..';
import { COLORS } from '../../common';

const CONST = OpenConnectionInputConstants;

type Ctx = {
  self: string;
  props: CommandTextboxProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Command.Textbox')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      self: '<CUID>',
      props: {
        spinner: false,
        theme: 'Dark',
        // theme: 'Light',
        // theme: CONST.DEFAULT.THEME,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('spinner', (e) => {
      if (e.changing) e.ctx.props.spinner = e.changing.next;
      e.boolean.current = e.ctx.props.spinner;
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('theme')
        .items(CONST.THEMES)
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.hr();
    e.component((e) => {
      return <ObjectView name={'props'} data={e.ctx.props} style={{ MarginX: 15 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    const { theme = CONST.DEFAULT.THEME } = e.ctx.props;
    const isLight = theme === 'Light';

    e.settings({
      host: {
        background: isLight ? -0.04 : COLORS.DARK,
      },
      layout: {
        cropmarks: isLight ? -0.2 : 0.2,
        labelColor: isLight ? -0.5 : 0.8,
      },
    });

    e.render(<CommandTextbox {...e.ctx.props} onAction={(e) => console.log('onAction:', e)} />);
  });

export default actions;
