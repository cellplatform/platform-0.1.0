import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { PositioningContainer } from '..';
import { css, deleteUndefined, t, COLORS } from '../common';
import { SampleChild } from './DEV.Sample.Child';
import { SampleRoot } from './DEV.Sample.Root';
import { EdgeDropdown } from './EdgeDropdown';
import { Ctx } from './types';
import { PositioningContainerConfig } from '../PositioningContainer.Config';
import { PositioningContainerProperties } from '../PositioningContainer.Properties';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.PositioningContainer')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      background: false,
      child: {},
      props: { position: { x: 'center', y: 'bottom' } },
      config: { isEnabled: true },
    };
  })

  .items((e) => {
    e.title('Positioning Container');
    e.hr();

    e.component((e) => {
      return <PositioningContainerProperties props={e.ctx.props} style={{ Margin: [10, 30] }} />;
    });

    e.hr();

    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.config.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.config.isEnabled;
    });

    e.boolean('background', (e) => {
      if (e.changing) e.ctx.background = e.changing.next;
      e.boolean.current = e.ctx.background;
    });

    e.hr(1, 0.1);

    e.boolean('child.width', (e) => {
      if (e.changing) e.ctx.child.width = e.changing.next ? 350 : undefined;
      e.boolean.current = typeof e.ctx.child.width === 'number';
    });

    e.boolean('child.height', (e) => {
      if (e.changing) e.ctx.child.height = e.changing.next ? 180 : undefined;
      e.boolean.current = typeof e.ctx.child.height === 'number';
    });

    e.hr();
  })

  .items((e) => {
    e.title('Position');
    const D = EdgeDropdown;

    function setPosition(ctx: Ctx, key: keyof t.BoxPosition, value?: string) {
      if (value === 'none') value = undefined;
      const position = ctx.props.position ?? (ctx.props.position = {});
      position[key] = value as any;
      ctx.props.position = deleteUndefined(position);
    }

    e.select((c) => {
      D.x(c, 'edge.x', c.ctx.props.position?.x, (e) => setPosition(e.ctx, 'x', e.value));
    });
    e.select((c) => {
      D.y(c, 'edge.y', c.ctx.props.position?.y, (e) => setPosition(e.ctx, 'y', e.value));
    });

    e.hr();

    e.component((e) => {
      const styles = {
        base: css({ Margin: [10, 30], display: 'grid' }),
        container: css({ justifySelf: 'center', alignSelf: 'center' }),
      };

      return (
        <div {...styles.base}>
          <PositioningContainerConfig
            position={e.ctx.props.position}
            isEnabled={e.ctx.config.isEnabled}
            style={styles.container}
            onChange={({ next }) => {
              e.change.ctx((ctx) => (ctx.props.position = next));
            }}
          />
        </div>
      );
    });

    e.hr();
  })

  .items((e) => {
    e.component((e) => {
      const data = e.ctx.props.position;
      return <ObjectView name={'position'} data={data} style={{ MarginX: 20, MarginY: 10 }} />;
    });
  })

  .subject((e) => {
    const { child } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<PositioningContainer>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
      },
    });

    const styles = {
      container: css({
        backgroundColor: e.ctx.background && 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };

    e.render(
      <SampleRoot>
        <PositioningContainer {...e.ctx.props} style={styles.container}>
          <SampleChild width={child.width} height={child.height} />
        </PositioningContainer>
      </SampleRoot>,
    );
  });

export default actions;
