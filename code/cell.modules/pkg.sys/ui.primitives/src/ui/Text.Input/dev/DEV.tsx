import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { TextInput, TextInputProps } from '..';
import { t, rx, slug } from '../common';

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
        instance: { bus: rx.bus(), id: `foo.${slug()}` },
        placeholder: 'my placeholder',
        placeholderStyle: {
          italic: true,
          opacity: 0.3,
        },
        focusOnLoad: true,
        focusAction: 'SELECT',
        // focusAction: 'END',
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
        width: 200,
        cropmarks: -0.2,
      },
    });
    e.render(<TextInput {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
