import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { TextInput, TextInputProps } from '..';

type Ctx = { props: TextInputProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Text.Input')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        placeholder: 'my placeholder',
        placeholderStyle: {
          italic: true,
          opacity: 0.3,
        },
        focusOnLoad: true,
        focusAction: 'SELECT',
        onChange(e) {
          change.ctx((ctx) => (ctx.props.value = e.to));
        },
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.textbox((config) =>
      config
        .title('placeholder')
        .initial((config.ctx.props.placeholder || '<nothing>').toString())
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            e.textbox.current = e.changing.next || undefined;
            e.ctx.props.placeholder = e.textbox.current;
          }
        }),
    );

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
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<TextInput>',
        // position: [150, 80],
        width: 400,
        // border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });
    e.render(<TextInput {...e.ctx.props} />);
  });

export default actions;
