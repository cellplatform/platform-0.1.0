import React, { useEffect, useState } from 'react';

import { Textbox, TextboxDisplayForamts, TextboxProps } from '..';
import { DevActions } from '../../..';
import { color, COLORS } from '../../common';
import { Icons } from '../../Icons';

type Ctx = { props: TextboxProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.dev/Textbox')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      props: {
        placeholder: 'my placeholder',
        enter: {
          icon: (e) => {
            const col = e.isFocused || e.value ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3);
            const el = <Icons.Send size={18} color={col} />;
            return el;
          },
        },
      },
    };
  })

  .items((e) => {
    e.title('Props');
    e.button('placeholder', (e) => (e.ctx.props.placeholder = 'My placeholder'));
    e.button('placeholder: none', (e) => (e.ctx.props.placeholder = undefined));

    e.hr(1, 0.2);

    e.button('value', (e) => (e.ctx.props.value = 'My value'));
    e.button('value: none', (e) => (e.ctx.props.value = undefined));

    e.hr();
  })

  .items((e) => {
    e.title('Style');

    e.select((config) =>
      config
        .title('displayFormat')
        .items(TextboxDisplayForamts)
        .initial(TextboxDisplayForamts[0])
        .view('buttons')
        .pipe(async (e) => {
          const value = e.select.current[0].value; // NB: always first.
          e.ctx.props.displayFormat = value;
        }),
    );

    e.select((config) =>
      config
        .title('fontSize')
        .items([
          { label: 'small - 12', value: 12 },
          { label: 'normal - 14', value: 14 },
          { label: 'large - 18', value: 18 },
        ])
        .initial(14)
        .view('buttons')
        .pipe(async (e) => {
          const props = e.ctx.props;
          const item = e.select.current[0]; // NB: always first.
          props.style = { ...props.style, fontSize: item.value };
          e.select.current = [item];
        }),
    );

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Textbox>',
        cropmarks: -0.2,
        width: 350,
      },
    });

    const style = { flex: 1, ...e.ctx.props.style };

    e.render(<Sample {...e.ctx.props} style={style} />);
  });

export default actions;

/**
 * Sample layout.
 */
export const Sample: React.FC<TextboxProps> = (props) => {
  const [value, setValue] = useState<string>(props.value || '');

  useEffect(() => setValue(props.value || ''), [props.value]);

  return <Textbox {...props} value={value} onChange={(e) => setValue(e.to)} style={props.style} />;
};
