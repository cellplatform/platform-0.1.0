import React from 'react';
import { ActionSelectConfigArgs, DevActions, ObjectView } from 'sys.ui.dev';

import { PositioningContainer } from '..';
import { deleteUndefined, t } from '../common';
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
    return {
      child: {},
      props: {},
    };
  })

  .items((e) => {
    e.title('Dev Tools');

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
      console.log('temp 🐷🐷🐷 - setPosition'); // TEMP 🐷
      if (value === 'none') value = undefined;
      const position = ctx.props.position ?? (ctx.props.position = {});
      position[key] = value as any;
      ctx.props.position = deleteUndefined(position);
    }

    e.select((config) => D.x(config, 'edge.x', (e) => setPosition(e.ctx, 'x', e.value)));
    e.select((config) => D.y(config, 'edge.y', (e) => setPosition(e.ctx, 'y', e.value)));

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

    e.render(
      <SampleRoot>
        <PositioningContainer {...e.ctx.props}>
          <SampleChild width={child.width} height={child.height} />
        </PositioningContainer>
      </SampleRoot>,
    );
  });

export default actions;
