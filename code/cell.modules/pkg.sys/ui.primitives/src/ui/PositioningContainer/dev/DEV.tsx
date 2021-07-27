import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { PositioningContainer } from '..';
import { css, deleteUndefined, t } from '../common';
import { PositioningContainerConfig } from '../PositioningContainer.Config';
import { PositioningContainerProperties } from '../PositioningContainer.Properties';
import { SampleChild } from './DEV.Sample.Child';
import { SampleRoot } from './DEV.Sample.Root';
import { EdgeDropdown } from './EdgeDropdown';
import { Ctx } from './types';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.PositioningContainer')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      child: {},
      props: { position: { x: 'center', y: 'bottom' } },
      debug: { background: false, isConfigEnabled: true },
      onSize: (size) => e.change.ctx((ctx) => (ctx.debug.size = size)),
    };

    return ctx;
  })

  .items((e) => {
    e.title('Positioning Container');
    e.hr();

    e.component((e) => {
      return (
        <PositioningContainerProperties
          props={e.ctx.props}
          size={e.ctx.debug.size}
          style={{ Margin: [10, 30] }}
        />
      );
    });

    e.component((e) => {
      const styles = {
        base: css({ Margin: [10, 30], display: 'grid' }),
        container: css({ justifySelf: 'center', alignSelf: 'center' }),
      };
      return (
        <div {...styles.base}>
          <PositioningContainerConfig
            position={e.ctx.props.position}
            isEnabled={e.ctx.debug.isConfigEnabled}
            style={styles.container}
            onChange={({ next }) => e.change.ctx((ctx) => (ctx.props.position = next))}
          />
        </div>
      );
    });

    e.hr();

    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.debug.isConfigEnabled = e.changing.next;
      e.boolean.current = e.ctx.debug.isConfigEnabled;
    });

    e.boolean('background', (e) => {
      if (e.changing) e.ctx.debug.background = e.changing.next;
      e.boolean.current = e.ctx.debug.background;
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
        backgroundColor: e.ctx.debug.background && 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };

    e.render(
      <SampleRoot>
        <PositioningContainer {...e.ctx.props} style={styles.container} onSize={e.ctx.onSize}>
          <SampleChild width={child.width} height={child.height} />
        </PositioningContainer>
      </SampleRoot>,
    );
  });

export default actions;
