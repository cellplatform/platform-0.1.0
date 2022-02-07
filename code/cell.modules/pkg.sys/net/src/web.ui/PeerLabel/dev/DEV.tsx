import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { PeerLabel, PeerLabelProps } from '..';

type Ctx = { props: PeerLabelProps };

const DEFAULT = { id: 'peer:ckzdck7q200643e5z6mt57iul' };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.PeerLabel')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        id: DEFAULT.id,
        isCopyable: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('isCopyable', (e) => {
      if (e.changing) e.ctx.props.isCopyable = e.changing.next;
      e.boolean.current = e.ctx.props.isCopyable;
    });

    e.hr();

    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<PeerLabel>',
        // position: [150, 80],
        // border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });
    e.render(<PeerLabel {...e.ctx.props} />);
  });

export default actions;
