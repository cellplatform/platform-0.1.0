import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { PropList, PropListProps } from '..';
import { COLORS, css, Icons } from './common';
import { items, LOREM } from './DEV.items';

type Ctx = { props: PropListProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/PropList')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      props: {
        title: 'MyTitle',
        titleEllipsis: true,
        defaults: { clipboard: false },
        items,
      },
    };
  })

  .items((e) => {
    e.title('Defaults');

    e.boolean('clipboard', (e) => {
      const props = e.ctx.props;
      if (e.changing) props.defaults = { ...props.defaults, clipboard: e.changing.next };
      e.boolean.current = Boolean(props.defaults?.clipboard);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Title');

    e.textbox((config) =>
      config
        .initial(config.ctx.props.title?.toString() || '')
        .placeholder('title')
        .pipe((e) => {
          if (e.changing) {
            const title = e.changing.next;
            e.textbox.current = title;
            e.ctx.props.title = title;
          }
        }),
    );

    e.boolean('ellipsis', (e) => {
      if (e.changing) e.ctx.props.titleEllipsis = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.titleEllipsis);
    });

    e.hr(1, 0.1);

    e.button('none', (e) => (e.ctx.props.title = undefined));
    e.button('short', (e) => (e.ctx.props.title = 'My Title'));
    e.button('lorem ipsum', (e) => (e.ctx.props.title = LOREM));
    e.button('<Component>', (e) => {
      const styles = {
        base: css({ Flex: 'horizontal-center-center', backgroundColor: 'rgba(255, 0, 0, 0.1)' }),
        title: css({ marginRight: 5 }),
      };
      e.ctx.props.title = (
        <div {...styles.base}>
          <div {...styles.title}>This is my title</div>
          <Icons.Face size={20} color={COLORS.MAGENTA} />
        </div>
      );
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      layout: { cropmarks: -0.2, width: 260 },
      host: { background: -0.04 },
    });

    e.render(<PropList {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
