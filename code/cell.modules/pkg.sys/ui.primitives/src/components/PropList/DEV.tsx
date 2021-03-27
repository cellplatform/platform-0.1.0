import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { PropList, PropListProps, PropListItem } from '.';
import { css, COLORS } from '../../common';
import { Icons } from '../Icons';

type Ctx = { props: PropListProps };

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/PropList')
  .context((prev) => {
    if (prev) return prev;

    const styles = {
      label: css({
        boxSizing: 'border-box',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        flex: 1,
        height: 40,
        padding: 3,
        paddingLeft: 30,
        Flex: 'horizontal-end-end',
        color: COLORS.MAGENTA,
      }),
      value: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        height: 40,
        Flex: 'center-center',
        flex: 1,
      }),
    };

    const items: PropListItem[] = [
      { label: 'string', value: 'hello' },
      { label: 'number', value: { data: 123456, clipboard: 'Value: 123456', monospace: true } },
      { label: 'boolean', value: true },
      { label: 'thing monospace', value: { data: 'thing', clipboard: true, monospace: true } },
      { label: 'long (ellipsis)', value: LOREM },
      {
        label: 'click handler',
        value: {
          data: 'click me',
          onClick: (e) => e.message(<div style={{ color: COLORS.MAGENTA }}>foobar</div>, 3000),
        },
      },
      {
        label: 'label',
        value: <div {...styles.value}>value</div>,
      },

      {
        label: <div {...styles.label}>label</div>,
        value: 'value',
      },
    ];

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
      layout: {
        cropmarks: -0.2,
        width: 260,
      },
      host: { background: -0.04 },
    });
    e.render(<PropList {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
