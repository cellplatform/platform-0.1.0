import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { ModuleCard, ModuleCardProps } from '..';
import { t, rx, slug } from '../common';

type Ctx = {
  props: ModuleCardProps;
  debug: Debug;
  state: {
    current?: t.CmdCardState;
    onChange?: (e: t.CmdCardState) => void;
  };
};
type Debug = {
  size: { width: number; height: number };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module.Card')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        instance: { bus: rx.bus(), id: `foo.${slug()}` },
      },
      debug: {
        size: { width: 500, height: 320 },
      },
      state: {
        onChange(state) {
          console.log('onChange', state);
          e.change.ctx((ctx) => (ctx.state.current = state));
        },
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Debug');

    const size = (width: number, height: number, suffix?: string) => {
      const label = `size: ${width} x ${height}${suffix ?? ''}`;
      e.button(label, (e) => (e.ctx.debug.size = { width, height }));
    };

    size(200, 100, ' - too small');
    size(500, 320, ' - (default)');
    size(800, 600);

    e.hr();
    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
    e.hr(1, 0.1);
    e.component((e) => {
      return (
        <ObjectView
          name={'state'}
          data={e.ctx.state.current}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$', '$.backdrop', '$.body']}
        />
      );
    });
  })

  .subject((e) => {
    const { debug } = e.ctx;
    const { width, height } = debug.size;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<ModuleCard>',
        cropmarks: -0.2,
        width,
        height,
      },
    });
    e.render(<ModuleCard {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
