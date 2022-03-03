import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { BulletList, BulletListProps } from '..';
import {
  RenderCtx,
  sampleBodyRendererFactory,
  sampleBulletRendererFactory,
} from './Sample.renderers';
import { k, DEFAULTS, ALL, t, rx, time, value } from '../common';

type D = { msg: string };

type Ctx = {
  bus: t.EventBus<any>;
  instance: string;
  items: k.BulletItem[];
  props: BulletListProps; // Common properties.
  renderCtx: RenderCtx;
  events: k.BulletListEvents;
  debug: { scrollAlign: k.BulletListItemAlign; virtualPadding: boolean };
  redraw(): Promise<void>;
};

const Util = {
  addItem(ctx: Ctx, options: { spacing?: k.BulletSpacing } = {}) {
    const { spacing } = options;
    const items = ctx.items;

    const data: D = { msg: `item-${items.length + 1}` };
    const item: k.BulletItem<D> = { data, spacing };

    ctx.items.push(item);
    return item;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.BulletList')
  .context((e) => {
    if (e.prev) return e.prev;

    const getRenderCtx = () => e.current?.renderCtx as RenderCtx;
    const renderer = {
      bullet: sampleBulletRendererFactory(getRenderCtx),
      body: sampleBodyRendererFactory(getRenderCtx),
    };

    const bus = rx.bus();
    const instance = 'sample.foo';
    const events = BulletList.Virtual.Events({ bus, instance });

    const ctx: Ctx = {
      bus,
      instance,
      events,
      items: [],
      props: {
        orientation: 'y',
        bullet: { edge: 'near', size: 60 },
        renderers: renderer,
        spacing: 10,
        debug: { border: true },
      },
      renderCtx: {
        enabled: true,
        bulletKind: 'Lines',
        bodyKind: 'Card',
        connectorRadius: 20,
        connectorLineWidth: 5,
        virtualScroll: true,
      },
      debug: { scrollAlign: 'auto', virtualPadding: true },
      redraw: async () => time.delay(0, () => events.redraw.fire()),
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    ctx.events.$.subscribe((e) => console.log('events.$:', e));
    new Array(3).fill(ctx).forEach(() => Util.addItem(ctx));
  })

  .items((e) => {
    e.boolean('render (reset)', (e) => {
      if (e.changing) e.ctx.renderCtx.enabled = e.changing.next;
      e.boolean.current = e.ctx.renderCtx.enabled;
    });

    e.hr(1, 0.1);

    e.boolean('virtual (scrolling)', (e) => {
      if (e.changing) e.ctx.renderCtx.virtualScroll = e.changing.next;
      e.boolean.current = e.ctx.renderCtx.virtualScroll;
    });

    e.boolean('virtual (padding)', (e) => {
      if (e.changing) e.ctx.debug.virtualPadding = e.changing.next;
      e.boolean.current = e.ctx.debug.virtualPadding;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('orientation')
        .items([
          { label: 'x (horizontal)', value: 'x' },
          { label: 'y (vertical)', value: 'y' },
        ])
        .initial(config.ctx.props.orientation)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) {
            e.ctx.props.orientation = e.changing?.next[0].value;
            e.ctx.redraw();
          }
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet.edge')
        .initial(config.ctx.props.bullet?.edge)
        .items(['near', 'far'])
        .pipe((e) => {
          if (e.changing) {
            const bullet = e.ctx.props.bullet || (e.ctx.props.bullet = {});
            bullet.edge = e.changing?.next[0].value;
          }
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet.size')
        .items([15, 30, 60])
        .initial(config.ctx.props.bullet?.size)
        .pipe((e) => {
          if (e.changing) {
            const bullet = e.ctx.props.bullet || (e.ctx.props.bullet = {});
            bullet.size = e.changing?.next[0].value;
            e.ctx.redraw();
          }
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('border (trace lines)', (e) => {
      if (e.changing) {
        const debug = e.ctx.props.debug || (e.ctx.props.debug = {});
        debug.border = e.changing.next;
      }
      e.boolean.current = e.ctx.props.debug?.border ?? false;
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('spacing')
        .items([0, 5, 10, 20])
        .initial(config.ctx.props.spacing as number)
        .pipe((e) => {
          if (e.changing) {
            e.ctx.props.spacing = e.changing?.next[0].value;
            e.ctx.redraw();
          }
        });
    });

    e.hr();

    e.title('Bullet Renderers (Plugin)');

    e.select((config) => {
      config
        .title('bullet <Kind>')
        .items(['Lines', 'Dot', { label: 'undefined (use default)', value: undefined }])
        .initial(config.ctx.renderCtx.bulletKind)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) {
            e.ctx.renderCtx.bulletKind = e.changing?.next[0].value;
            e.ctx.redraw();
          }
        });
    });

    e.select((config) => {
      config
        .title('ConnectorLines: radius')
        .items([0, 20])
        .initial(config.ctx.renderCtx.connectorRadius)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.connectorRadius = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('ConnectorLines: lineWidth')
        .items([3, 5, 10])
        .initial(config.ctx.renderCtx.connectorLineWidth)
        .pipe((e) => {
          if (e.changing) {
            e.ctx.renderCtx.connectorLineWidth = e.changing?.next[0].value;
            e.ctx.redraw();
          }
        });
    });

    e.hr(1, 0.1);
    e.title('Plugin Renderer: Body');

    e.select((config) => {
      config
        .view('buttons')
        .title('body <Kind>')
        .items(['Card', 'Vanilla', { label: 'undefined (use default)', value: undefined }])
        .initial(config.ctx.renderCtx.bodyKind)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.bodyKind = e.changing?.next[0].value;
          e.ctx.redraw();
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Events (Virtual)');

    e.select((config) => {
      config
        .view('buttons')
        .title('Align (when scrolled to)')
        .items(ALL.AlignTypes)
        .initial(config.ctx.debug.scrollAlign)
        .pipe((e) => {
          if (e.changing) e.ctx.debug.scrollAlign = e.changing?.next[0].value;
        });
    });

    const scrollTo = (ctx: Ctx, target: k.BulletListScroll['target']) => {
      const align = ctx.debug.scrollAlign;
      ctx.events.scroll.fire(target, { align });
    };

    e.button('⚡️ scroll: "Top"', (e) => scrollTo(e.ctx, 'Top'));
    e.button('⚡️ scroll: <index> (middle)', (e) => {
      const total = e.ctx.items.length;
      const index = value.round(total / 2, 0);
      scrollTo(e.ctx, index);
    });
    e.button('⚡️ scroll: "Bottom"', (e) => scrollTo(e.ctx, 'Bottom'));

    e.hr(1, 0.1);

    e.button('⚡️ redraw', (e) => e.ctx.events.redraw.fire());
    e.hr();
  })

  .items((e) => {
    e.title('Items');
    e.button('clear', (e) => (e.ctx.items = []));
    e.hr(1, 0.1);

    const Add = {
      button(total: number, note?: string) {
        e.button(`add (${note ?? total})`, (e) => Add.handler(e.ctx, total));
      },
      handler(ctx: Ctx, total: number) {
        new Array(total).fill(ctx).forEach((ctx) => Util.addItem(ctx));
      },
    };

    Add.button(1);
    Add.button(10);
    Add.button(100);
    Add.button(1000, '1K');
    Add.button(10000, '10K');

    e.hr(1, 0.1);

    e.button('add (spacing: { before })', (e) => {
      Util.addItem(e.ctx, { spacing: { before: 30 } });
    });
    e.button('add (spacing: { after })', (e) => {
      Util.addItem(e.ctx, { spacing: { after: 30 } });
    });
    e.button('add (spacing: { before, after })', (e) => {
      Util.addItem(e.ctx, { spacing: { before: 15, after: 30 } });
    });

    e.hr(1, 0.1);

    e.button('remove: first', (e) => {
      const items = e.ctx.items;
      e.ctx.items = items?.slice(0, items.length - 1);
    });
    e.button('remove: last', (e) => {
      const items = e.ctx.items;
      e.ctx.items = items?.slice(items.length - 1);
    });

    e.hr();
  })

  .items((e) => {
    e.component((e) => {
      const total = e.ctx.items.length;
      const props = total < 100 ? e.ctx.props : { ...e.ctx.props, items: `BulletItem[${total}]` };
      return (
        <ObjectView
          name={'props'}
          data={props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { items, props, renderCtx, debug } = e.ctx;
    const total = items.length;

    const orientation = props.orientation ?? DEFAULTS.Orientation;
    const isHorizontal = orientation === 'x';
    const isVertical = orientation === 'y';
    const isVirtual = e.ctx.renderCtx.virtualScroll;

    const FIXED_SIZE = 310;

    e.settings({
      host: { background: -0.04 },
      layout: total > 0 && {
        cropmarks: -0.2,
        position: !isVirtual ? undefined : isVertical ? [150, null] : [null, 150],
        width: isVirtual && isVertical ? FIXED_SIZE : undefined,
        height: isVirtual && isHorizontal ? FIXED_SIZE : undefined,
        border: isVirtual ? -0.1 : undefined,
        label: {
          topLeft: `<BulletList>[${total}]`,
          topRight: isVirtual ? `"virtual rendering"` : ``,
          bottomLeft: isVirtual ? `scrollable` : ``,
          bottomRight: `Body:"${e.ctx.renderCtx.bodyKind}"`,
        },
      },
    });

    if (total === 0) return;
    if (!renderCtx.enabled) return;

    /**
     * Simple (non-scrolling) layout.
     */
    if (!isVirtual) {
      e.render(<BulletList.Layout {...props} items={items} />);
    }

    /**
     * Virtual scolling list.
     */
    if (isVirtual) {
      const getData: k.GetBulletItem = (index) => items[index];

      const getSize: k.GetBulletItemSize = (e) => {
        const spacing = (props.spacing || 0) as number;
        const kind = renderCtx.bodyKind;

        // NB: These are fixed sizes for testing only.
        //     Will not adjust if the card content expands.
        let size = e.is.vertical ? 84 : 250; // Debug card (default).
        if (kind === 'Card') size = e.is.vertical ? 45 : 167;
        if (kind === 'Vanilla') size = e.is.vertical ? 23 : 118;

        if (!e.is.first) size += spacing;
        return size;
      };

      e.render(
        <BulletList.Virtual
          {...props}
          items={{ total, getData, getSize }}
          event={{ bus: e.ctx.bus, instance: e.ctx.instance }}
          paddingNear={debug.virtualPadding ? 50 : 0}
          paddingFar={debug.virtualPadding ? 150 : 0}
          style={{ flex: 1 }}
        />,
      );
    }
  });

export default actions;
