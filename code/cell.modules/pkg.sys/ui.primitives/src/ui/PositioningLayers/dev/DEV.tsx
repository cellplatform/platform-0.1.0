import React from 'react';
import { ActionButtonHandlerArgs, DevActions } from 'sys.ui.dev';

import { PositioningLayers, PositioningLayersProps } from '..';
import { t } from '../common';
import { PositioningLayersProperties } from '../PositioningLayers.Properties';
import { PositioningLayersPropertiesStack } from '../PositioningLayers.PropertiesStack';
import { Sample } from './DEV.Sample';

type Ctx = {
  debug: { current?: number };
  props: PositioningLayersProps;
};
type A = ActionButtonHandlerArgs<Ctx>;

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.PositioningLayers')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {},
      debug: {},
    };
    return ctx;
  })

  .items((e) => {
    e.title('Positioning Layers');

    const insert = (e: A, position: t.BoxPosition) => {
      const layers = e.ctx.props.layers ?? (e.ctx.props.layers = []);
      const layer: t.PositioningLayer = {
        id: `thing-${layers.length + 1}`,
        position,
        el(e) {
          const info = e.find.first(layer.id);
          const overlaps = e.find.overlap(e.index);
          return <Sample id={info?.id ?? layer.id} info={info} overlaps={overlaps} find={e.find} />;
        },
      };
      layers.push(layer);
    };

    e.button('insert: top left', (e) => insert(e, { x: 'left', y: 'top' }));
    e.button('insert: center bottom', (e) => insert(e, { x: 'center', y: 'bottom' }));
    e.button('insert: right center', (e) => insert(e, { x: 'right', y: 'center' }));
    e.button('insert: bottom right', (e) => insert(e, { x: 'right', y: 'bottom' }));

    e.hr(1, 0.1);
    e.button('clear', (e) => (e.ctx.props.layers = undefined));

    e.hr();

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
              const layers = ctx.props.layers ?? (ctx.props.layers = []);
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
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<PositioningLayers>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<PositioningLayers {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
