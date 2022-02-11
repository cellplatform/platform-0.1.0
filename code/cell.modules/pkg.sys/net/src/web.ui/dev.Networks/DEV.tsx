import React from 'react';
import { DevActions, ObjectView, toObject } from 'sys.ui.dev';

import { css, PeerNetwork, rx, t } from './DEV.common';
import { DevSample, DevSampleProps } from './DEV.Sample';
import { DevNetworkConstants } from './DEV.Network';

type Ctx = {
  props: DevSampleProps;
  debug: { background: boolean };
};

const DEFAULT = {
  SIGNAL_SERVER: 'rtc.cellfs.com',
  VIEW: 'Collection',
  // VIEW: 'Singular',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('dev.Networks')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        // view: 'Collection',
        view: 'Singular',
        // view: DevNetworkConstants.DEFAULT.VIEW,
        networks: [],
      },
      debug: { background: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    if (ctx.props.networks.length === 0) {
      await addNetwork(ctx);
      await addNetwork(ctx);
    }
  })

  .items((e) => {
    e.title('Network Client');

    e.select((config) => {
      config
        .view('buttons')
        .title('view')
        .items(DevNetworkConstants.VIEWS)
        .initial(config.ctx.props.view)
        .pipe((e) => {
          if (e.changing) e.ctx.props.view = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.button('add', (e) => addNetwork(e.ctx));

    e.hr(1, 0.1);
    e.button('clear', (e) => {
      const ctx = e.ctx;
      ctx.props.networks.forEach((net) => net.dispose());
      ctx.props.networks = [];
    });

    e.button('remove (last)', (e) => {
      const ctx = e.ctx;
      const index = ctx.props.networks.length - 1;
      const last = ctx.props.networks[index];
      if (last) {
        ctx.props.networks = ctx.props.networks.slice(0, index);
        last.dispose();
      }
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('background', (e) => {
      if (e.changing) e.ctx.debug.background = e.changing.next;
      e.boolean.current = e.ctx.debug.background;
    });

    e.hr();
    e.component((e) => {
      return (
        <ObjectView name={'props'} data={e.ctx.props} style={{ MarginX: 15 }} expandPaths={['$']} />
      );
    });
  })

  .subject((e) => {
    const { debug, props } = e.ctx;
    const { networks = [] } = props;
    const isEmpty = networks.length === 0;

    const view = props.view ?? DevNetworkConstants.DEFAULT.VIEW;
    const isCollection = view === 'Collection';
    const isUri = view === 'URI';

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        position: isCollection ? [60, 40, 80, 40] : undefined,
        background: debug.background ? 1 : 0,
        label: !isUri && {
          topLeft: !isEmpty && 'Peer-to-Peer',
          bottomLeft: !isEmpty && `WebRTC Signal: "${DEFAULT.SIGNAL_SERVER}"`,
        },
      },
    });

    /**
     * [Render]
     */
    const styles = {
      base: css({
        flex: 1,
        Scroll: isCollection,
        Padding: debug.background ? [70, 45] : undefined,
      }),
    };

    e.render(
      <div {...styles.base}>
        <DevSample {...props} />
      </div>,
    );
  });

export default actions;

/**
 * Helpers
 */

async function addNetwork(ctx: Ctx) {
  const bus = rx.bus();
  const signal = DEFAULT.SIGNAL_SERVER;
  const network = await PeerNetwork.start({ bus, signal });
  ctx.props.networks.push(network);
}
