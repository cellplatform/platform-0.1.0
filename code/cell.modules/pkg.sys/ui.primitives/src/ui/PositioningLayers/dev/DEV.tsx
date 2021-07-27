import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { PositioningLayers, PositioningLayersProps } from '..';
import { LayerProperties } from '../Layer.Properties';
import { PositioningLayersPropertiesStack } from '../PositioningLayers.PropertiesStack';
import { PositioningLayersProperties } from '../PositioningLayers.Properties';
import { t, css, color } from '../common';

type Ctx = { props: PositioningLayersProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.PositioningLayers')
  .context((e) => {
    if (e.prev) return e.prev;
    return { props: {} };
  })

  .items((e) => {
    e.title('Positioning Layers');
    e.hr();

    e.component((e) => {
      const x = 30;
      return <PositioningLayersProperties props={e.ctx.props} style={{ Margin: [10, x, 10, x] }} />;
    });

    e.hr(1, 0.1);

    e.component((e) => {
      const x = 30;
      return (
        <PositioningLayersPropertiesStack
          layers={e.ctx.props.layers}
          style={{ Margin: [20, x, 20, x] }}
        />
      );
    });

    e.hr();
  })

  .items((e) => {
    e.button('tmp', (e) => {
      const layers = e.ctx.props.layers ?? (e.ctx.props.layers = []);

      const styles = {
        base: css({
          border: `dashed 1px ${color.format(-0.1)}`,
          borderRadius: 8,
          padding: 15,
        }),
      };

      const layer: t.PositioningLayer = {
        position: { x: 'center', y: 'bottom' },
        body() {
          return <div {...styles.base}>Hello 👋</div>;
        },
      };

      layers.push(layer);
    });
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
