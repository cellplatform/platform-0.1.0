import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { CmdTextbox, CmdTextboxProps, CmdTextboxContants } from '..';
import { COLORS } from '../../common';

const CONST = CmdTextboxContants;

type Ctx = {
  props: CmdTextboxProps;
  debug: { isControlled: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Cmd.Textbox')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        placeholder: 'command',
        spinner: false,
        pending: false,
        theme: 'Dark',
        onChange(event) {
          e.change.ctx((ctx) => {
            const isControlled = e.current?.debug.isControlled ?? true;
            const value = isControlled ? event.to : undefined;
            ctx.props.text = value;
          });
        },
        onAction(e) {
          console.log('onAction:', e);
        },
      },
      debug: { isControlled: true },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

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

    e.boolean('spinner', (e) => {
      if (e.changing) e.ctx.props.spinner = e.changing.next;
      e.boolean.current = e.ctx.props.spinner;
    });

    e.boolean('pending', (e) => {
      if (e.changing) e.ctx.props.pending = e.changing.next;
      e.boolean.current = e.ctx.props.pending;
    });

    e.textbox((config) =>
      config
        .title('placeholder')
        .initial(config.ctx.props.placeholder || '<nothing>')
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            e.textbox.current = e.changing.next || undefined;
            e.ctx.props.placeholder = e.textbox.current;
          }
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('controlled (state)', (e) => {
      if (e.changing) {
        const isControlled = e.changing.next;
        e.ctx.debug.isControlled = isControlled;
        if (isControlled) e.ctx.props.text = undefined;
      }
      e.boolean.current = e.ctx.debug.isControlled;
    });

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

    e.render(<CmdTextbox {...e.ctx.props} />);
  });

export default actions;
