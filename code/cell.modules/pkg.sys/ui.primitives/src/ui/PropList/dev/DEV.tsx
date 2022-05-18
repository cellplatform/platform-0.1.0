import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { PropList, PropListProps } from '..';
import { COLORS, css, Icons } from './DEV.common';
import { sampleItems, LOREM } from './DEV.Samples';
import { BuilderSample, MyFields } from './DEV.Sample.Builder';

type SampleKind = 'Samples' | 'Builder';

type Ctx = {
  props: PropListProps;
  debug: { source: SampleKind; fields?: MyFields[] };
};

const Util = {
  toItems(ctx: Ctx) {
    const debug = ctx.debug;
    if (debug.source === 'Samples') return sampleItems;

    if (debug.source === 'Builder') {
      const fields = debug.fields;
      return BuilderSample.toItems({ fields });
    }

    return [];
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.PropList')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      props: {
        // items,
        title: 'MyTitle',
        titleEllipsis: true,
        defaults: { clipboard: false },
        theme: 'Light',
        // theme: 'Dark',
      },
      debug: {
        source: 'Samples',
        // source: 'Builder',
      },
    };
  })

  .items((e) => {
    e.title('Props');

    e.boolean('defaults.clipboard', (e) => {
      const props = e.ctx.props;
      if (e.changing) props.defaults = { ...props.defaults, clipboard: e.changing.next };
      e.boolean.current = Boolean(props.defaults?.clipboard);
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('theme')
        .items(PropList.THEMES)
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
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

  .items((e) => {
    e.title('Debug');

    e.select((config) => {
      const items: SampleKind[] = ['Samples', 'Builder'];
      config
        .title('sample source')
        .items(items)
        .initial(config.ctx.debug.source)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.source = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.select((config) =>
      config
        .title('builder fields:')
        .items(BuilderSample.allFields)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as MyFields[];
            e.ctx.debug.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();
  })

  .subject((e) => {
    const { props } = e.ctx;

    const theme = props.theme ?? PropList.DEFAULTS.theme;
    const isLight = theme === 'Light';
    const items = Util.toItems(e.ctx);

    e.settings({
      host: { background: isLight ? -0.04 : COLORS.DARK },
      layout: {
        cropmarks: isLight ? -0.2 : 0.6,
        labelColor: isLight ? -0.5 : 0.8,
        width: 260,
      },
    });

    e.render(<PropList {...props} items={items} style={{ flex: 1 }} />);
  });

export default actions;
