import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { TextSecret, TextSecretProps } from '..';

type Ctx = { props: TextSecretProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Text.Secret')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        text: 'abcdefg123456',
        hidden: true,
        monospace: false,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('hidden', (e) => {
      if (e.changing) e.ctx.props.hidden = e.changing.next;
      e.boolean.current = e.ctx.props.hidden;
    });

    e.boolean('monospace', (e) => {
      if (e.changing) e.ctx.props.monospace = e.changing.next;
      e.boolean.current = e.ctx.props.monospace;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Text');

    const text = (label: string, text?: string) => {
      e.button(label, (e) => (e.ctx.props.text = text));
    };

    text('empty ("")', '');
    text('<undefined>', undefined);
    text('password: "abcdefg123456"', 'abcdefg123456');
    text('long: (hash)', 'ca00241ed17dd01c8248432c4816445127c1905cf244fe34abbbb5c8b0e9d04==');

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

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
      layout: { cropmarks: -0.2 },
    });
    e.render(<TextSecret {...e.ctx.props} />);
  });

export default actions;
