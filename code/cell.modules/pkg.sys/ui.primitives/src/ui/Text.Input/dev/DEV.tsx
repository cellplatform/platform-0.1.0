import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { TextInput, TextInputProps } from '..';
import { t, rx, slug } from '../common';

type Ctx = {
  props: TextInputProps;
  debug: { isNumericMask: boolean };
};

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
        isEnabled: true,
        placeholder: 'my placeholder',
        placeholderStyle: { italic: true, opacity: 0.3 },
        focusOnLoad: true,
        focusAction: 'Select',

        autoCapitalize: false,
        autoComplete: false,
        autoCorrect: false,
        autoSize: false,

        onChange(e) {
          change.ctx((ctx) => (ctx.props.value = e.to));
        },
      },

      debug: { isNumericMask: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.props.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.props.isEnabled;
    });

    e.hr(1, 0.1);

    e.boolean('autoCapitalize', (e) => {
      if (e.changing) e.ctx.props.autoCapitalize = e.changing.next;
      e.boolean.current = e.ctx.props.autoCapitalize;
    });

    e.boolean('autoComplete', (e) => {
      if (e.changing) e.ctx.props.autoComplete = e.changing.next;
      e.boolean.current = e.ctx.props.autoComplete;
    });

    e.boolean('autoCorrect', (e) => {
      if (e.changing) e.ctx.props.autoCorrect = e.changing.next;
      e.boolean.current = e.ctx.props.autoCorrect;
    });

    e.boolean('autoSize', (e) => {
      if (e.changing) e.ctx.props.autoSize = e.changing.next;
      e.boolean.current = e.ctx.props.autoSize;
    });

    e.boolean('spellCheck', (e) => {
      if (e.changing) e.ctx.props.spellCheck = e.changing.next;
      e.boolean.current = e.ctx.props.spellCheck;
    });

    e.hr(1, 0.1);

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
  })

  .items((e) => {
    e.title('Mask');

    e.boolean('isNumeric', (e) => {
      if (e.changing) e.ctx.debug.isNumericMask = e.changing.next;
      e.boolean.current = e.ctx.debug.isNumericMask;
    });
    e.hr();
  })

  .items((e) => {
    e.title('Debug');
    e.hr(1, 0.1);

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
    const { props, debug } = e.ctx;

    let mask: t.TextInputMaskHandler | undefined;
    if (debug.isNumericMask) mask = TextInput.Masks.isNumeric;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<TextInput>',
        width: props.autoSize ? undefined : 200,
        cropmarks: -0.2,
      },
    });
    e.render(<TextInput {...props} mask={mask} style={{ flex: 1 }} />);
  });

export default actions;
