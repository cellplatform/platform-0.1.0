import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { PositioningLayers, PositioningLayersProps, PositioningLayersSizeHandler } from '..';
import { t, rx } from '../common';
import { PositioningLayersProperties } from '../PositioningLayers.Properties';
import { PositioningLayersPropertiesStack } from '../PositioningLayers.PropertiesStack';
import { DevSample } from './DEV.Sample';

import { WebRuntime } from 'sys.runtime.web';

type Id = string;

type Ctx = {
  bus: t.EventBus;
  debug: { size?: t.DomRect; current?: number };
  props: PositioningLayersProps;
  selected?: Id;
  onSize: PositioningLayersSizeHandler;
};

const insert = (ctx: Ctx, position: t.BoxPosition) => {
  const layers = ctx.props.layers ?? (ctx.props.layers = []);
  const layer: t.PositioningLayer = {
    id: `thing-${layers.length + 1}`,
    position,
    render(e) {
      const info = e.find.first(layer.id);
      const overlaps = e.find.overlap(e.index);
      return <DevSample id={info?.id ?? layer.id} info={info} overlaps={overlaps} find={e.find} />;
    },
  };
  layers.push(layer);
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.PositioningLayers')
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
    e.title('Positioning Layers');

    e.button('insert: top left', (e) => insert(e.ctx, { x: 'left', y: 'top' }));
    e.button('insert: center center', (e) => insert(e.ctx, { x: 'center', y: 'center' }));
    e.button('insert: center bottom', (e) => insert(e.ctx, { x: 'center', y: 'bottom' }));
    e.button('insert: right center', (e) => insert(e.ctx, { x: 'right', y: 'center' }));
    e.button('insert: bottom right', (e) => insert(e.ctx, { x: 'right', y: 'bottom' }));
    e.hr(1, 0.1);
    e.button('insert: full screen', (e) => insert(e.ctx, { x: 'stretch', y: 'stretch' }));

    e.hr(1, 0.1);

    e.button('clear', (e) => {
      e.ctx.props.layers = undefined;
      e.ctx.debug.current = undefined;
    });

    e.hr();

    e.component((e) => {
      return (
        <WebRuntime.ui.ManifestSelectorStateful
          bus={e.ctx.bus}
          style={{ MarginX: 25, MarginY: 15 }}
        />
      );
    });

    e.component((e) => {
      const x = 30;
      return (
        <PositioningLayersProperties
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
        <PositioningLayersPropertiesStack
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
          topLeft: '<PositioningLayers>',
          topRight: !size ? undefined : `${size.width} x ${size.height} px`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<PositioningLayers {...e.ctx.props} style={{ flex: 1 }} onSize={e.ctx.onSize} />);
  });

export default actions;
