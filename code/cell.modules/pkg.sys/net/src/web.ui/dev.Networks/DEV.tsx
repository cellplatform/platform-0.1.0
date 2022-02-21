import React from 'react';

import { DevActions, ObjectView, TEST } from '../../web.test';
import {
  color,
  COLORS,
  css,
  DevConstants,
  EventBridge,
  MediaStream,
  PeerNetwork,
  rx,
} from './DEV.common';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  props: DevSampleProps;
  debug: { background: boolean };
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
        instance: 'instance.foo',
        // view: DevNetworkConstants.DEFAULT.VIEW,
        view: 'Collection',
        // view: 'Single',
        child: 'Placeholder',
        networks: [],
      },
      debug: { background: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;

    if (ctx.props.networks.length === 0) {
      const wait = Array.from({ length: 2 }).map(() => addNetwork(ctx, e.redraw));
      await Promise.all(wait);
    }
  })

  .items((e) => {
    e.title('Network Client');

    e.button('auto connect (peers)', (e) => autoConnect(e.ctx));
    e.hr(1, 0.1);

    e.title('View');
    e.select((config) => {
      config
        .view('buttons')
        .items(DevConstants.VIEWS)
        .initial(config.ctx.props.view)
        .pipe((e) => {
          if (e.changing) e.ctx.props.view = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('ChildKind')
        .items([
          { label: '<undefined> (use controller)', value: undefined },
          ...DevConstants.CHILD_KINDS,
        ])
        .initial(config.ctx.props.child)
        .pipe((e) => {
          if (e.changing) e.ctx.props.child = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);
  })

  .items((e) => {
    e.title('Collection');
    e.button('add', (e) => addNetwork(e.ctx, e.redraw));

    e.hr(1, 0.1);
    e.button('clear', (e) => {
      const ctx = e.ctx;
      ctx.props.networks.forEach((network) => network.dispose());
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

    e.button('redraw', (e) => e.redraw());

    e.hr();
    e.component((e) => {
      const obj = (name: string, data: any) => {
        return (
          <ObjectView
            name={name}
            data={data}
            style={{ MarginX: 15 }}
            fontSize={11}
            expandPaths={['$']}
          />
        );
      };

      const styles = {
        hr: css({ height: 1, Margin: [15, 0], backgroundColor: 'rgba(255, 0, 0, 0.1)' }),
      };

      const network = e.ctx.props.view === 'Single' ? e.ctx.props.networks[0] : undefined;
      const hr = <div {...styles.hr} />;

      return (
        <div>
          {obj('props (sample)', e.ctx.props)}
          {network && hr}
          {network && obj('network[0]', network)}
          {network && hr}
          {network && obj('network[0].status', network.status.current)}
        </div>
      );
    });
  })

  .subject((e) => {
    const { debug, props } = e.ctx;
    const { networks = [] } = props;
    const isEmpty = networks.length === 0;

    const view = props.view ?? DevConstants.DEFAULT.VIEW;
    const isCollection = view === 'Collection';
    const isSingle = view === 'Single';
    const isUri = view === 'URI';

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        position: isCollection ? [40, 40, 80, 40] : undefined,
        label: !isUri && {
          topLeft: !isEmpty && 'Peer-to-Peer',
          bottomLeft: !isEmpty && `WebRTC Signal: "${TEST.SIGNAL}"`,
        },
      },
    });

    /**
     * [Render]
     */
    const styles = {
      base: css({ flex: 1 }),
      outer: {
        base: css({
          Scroll: true,
          position: 'relative',
          overflow: 'hidden',
          minWidth: isSingle ? 930 : undefined,
        }),
        bg: css({
          Absolute: 0,
          Padding: [45, 45],
          background: color.alpha(COLORS.DARK, 0.08),
          border: `solid 1px ${color.format(-0.12)}`,
          boxShadow: `inset 0 0 15px 0 ${color.format(-0.06)}`,
        }),
      },
    };

    const outerStyle = css(
      styles.outer.base,
      debug.background || isCollection ? styles.outer.bg : undefined,
    );

    e.render(
      <div {...styles.base}>
        <div {...outerStyle}>
          <DevSample {...props} />
        </div>
      </div>,
    );
  });

export default actions;

/**
 * Helpers
 */

async function createNetwork() {
  const bus = rx.bus();
  const signal = TEST.SIGNAL;
  const { network } = await PeerNetwork.start({ bus, signal });

  MediaStream.Controller({ bus });
  EventBridge.startEventBridge({ self: network.netbus.self, bus });

  return network;
}

async function addNetwork(ctx: Ctx, redraw: () => void) {
  const network = await createNetwork();
  network.status.$.subscribe(redraw);
  ctx.props.networks.push(network);
}

async function autoConnect(ctx: Ctx) {
  const networks = ctx.props.networks;
  const [a, b] = networks;
  if (!a || !b) return;

  const conn = a.events.peer.connection(a.netbus.self, b.netbus.self);
  if (!(await conn.isConnected())) await conn.open.data({ isReliable: true });
}
