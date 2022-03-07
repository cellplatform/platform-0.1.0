import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { PositioningLayout, PositioningLayoutProps, PositioningLayoutSizeHandler } from '..';
import { t, rx } from '../common';
import { PositioningLayoutConfig } from '../PositioningLayout.Config';
import { PositioningLayoutConfigStack } from '../PositioningLayout.ConfigStack';
import { DevSample } from './DEV.Sample';

type Index = number;

type Ctx = {
  bus: t.EventBus;
  props: PositioningLayoutProps;
  debug: { size?: t.DomRect; current?: Index };
  onSize: PositioningLayoutSizeHandler;
};

const insert = (ctx: Ctx, position: t.BoxPosition) => {
  const layers = ctx.props.layers ?? (ctx.props.layers = []);
  const layer: t.PositioningLayer = {
    id: `thing-${layers.length + 1}`,
    position,
    render(e) {
      const info = e.find.first(layer.id);
      const id = info?.id ?? layer.id;
      const overlaps = e.find.overlap(e.index);
      return <DevSample id={id} info={info} overlaps={overlaps} find={e.find} />;
    },
  };
  layers.push(layer);
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.PositioningLayout')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();

    const ctx: Ctx = {
      bus,
      props: {},
      debug: { current: 0 },
      onSize(args) {
        e.change.ctx((ctx) => (ctx.debug.size = args.size));
      },
    };

    insert(ctx, { x: 'center', y: 'bottom' });
    return ctx;
  })

  .items((e) => {
    e.title('Insert');

    e.button('top left', (e) => insert(e.ctx, { x: 'left', y: 'top' }));
    e.button('center center', (e) => insert(e.ctx, { x: 'center', y: 'center' }));
    e.button('center bottom', (e) => insert(e.ctx, { x: 'center', y: 'bottom' }));
    e.button('right center', (e) => insert(e.ctx, { x: 'right', y: 'center' }));
    e.button('bottom right', (e) => insert(e.ctx, { x: 'right', y: 'bottom' }));
    e.hr(1, 0.1);
    e.button('full screen', (e) => insert(e.ctx, { x: 'stretch', y: 'stretch' }));

    e.hr(1, 0.1);

    e.button('clear', (e) => {
      e.ctx.props.layers = undefined;
      e.ctx.debug.current = undefined;
    });

    e.hr();

    e.component((e) => {
      const x = 30;
      return (
        <PositioningLayoutConfig
          props={e.ctx.props}
          current={e.ctx.debug.current}
          style={{ Margin: [10, x, 10, x] }}
        />
      );
    });

    e.hr(1, 0.1);

    e.component((e) => {
      const x = 30;
      return (
        <PositioningLayoutConfigStack
          layers={e.ctx.props.layers}
          current={e.ctx.debug.current}
          style={{ Margin: [20, x, 20, x] }}
          onLayerChange={({ index, layer }) => {
            e.change.ctx((ctx) => {
              const props = ctx.props;
              const layers = props.layers ?? (props.layers = []);
              layers[index] = layer;
            });
          }}
          onCurrentChange={({ next }) => {
            e.change.ctx((ctx) => (ctx.debug.current = next));
          }}
        />
      );
    });

    e.hr();
  })

  .subject((e) => {
    const size = e.ctx.debug.size;
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<PositioningLayout>',
          topRight: !size ? undefined : `${size.width} x ${size.height} px`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<PositioningLayout {...e.ctx.props} style={{ flex: 1 }} onSize={e.ctx.onSize} />);
  });

export default actions;
