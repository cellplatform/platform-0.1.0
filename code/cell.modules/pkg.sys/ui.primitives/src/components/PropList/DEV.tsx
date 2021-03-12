import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { PropList, PropListProps } from '.';

type Ctx = { props: PropListProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/PropList')
  .context((prev) => {
    if (prev) return prev;
    return {
      props: {
        title: 'My Title',
        items: [
          { label: 'string', value: 'hello' },
          { label: 'number', value: 123 },
          { label: 'boolean', value: true },
        ],
      },
    };
  })

  .items((e) => {
    e.title('props');

    e.textbox((config) =>
      config
        .initial(config.ctx.props.title || '')
        .placeholder('title')
        .pipe((e) => {
          if (e.changing) {
            const title = e.changing.next;
            e.textbox.current = title;
            e.ctx.props.title = title;
          }
        }),
    );
  })

  .subject((e) => {
    e.settings({
      layout: {
        cropmarks: -0.2,
        width: 260,
      },
      host: { background: -0.04 },
    });
    e.render(<PropList {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
