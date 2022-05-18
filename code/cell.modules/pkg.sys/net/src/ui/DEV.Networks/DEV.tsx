import React from 'react';

import { DevActions, ObjectView, TEST } from '../../test';
import { color, COLORS, css, DevConstants } from './DEV.common';
import { DevSample, DevSampleProps } from './DEV.Sample';

const IMAGE = {
  // "Desert Scene"
  BG_IMAGE: `https://images.unsplash.com/photo-1530953845756-f7ffd1ab1cf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2970&q=80`,
};

type Ctx = {
  props: DevSampleProps;
  debug: {
    background: boolean;
    backgroundImage: boolean;
  };
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
        // child: 'Placeholder',
        // child: undefined,
        networks: [],
      },
      debug: { background: false, backgroundImage: false },
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

    e.boolean('backgroundImage', (e) => {
      if (e.changing) e.ctx.debug.backgroundImage = e.changing.next;
      e.boolean.current = e.ctx.debug.backgroundImage;
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
          border: `solid 1px ${color.format(-0.12)}`,
          boxShadow: `inset 0 0 15px 0 ${color.format(-0.06)}`,
          background: color.alpha(COLORS.DARK, 0.08),
          backgroundImage: debug.backgroundImage ? `url(${IMAGE.BG_IMAGE})` : undefined,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }),
        behind: {
          base: css({ Absolute: 0, Flex: `x-stretch-stretch` }),
          left: css({
            flex: 1,
            backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          }),
          right: css({ width: 300, display: 'flex' }),
        },
      },
    };

    const outerStyle = css(
      styles.outer.base,
      // debug.background || isCollection ? { Padding: [45, 45] } : undefined,
      {
        Absolute: 0,
      },
    );

    const selectedNetwork = e.ctx.props.networks[0];
    console.log('firstNetwork', selectedNetwork);

    // const elBehind = (
    //   <div
    //     {...css(
    //       styles.outer.behind.base,
    //       debug.background || isCollection ? styles.outer.bg : undefined,
    //     )}
    //   >
    //     <div {...styles.outer.behind.left}>
    //       <DevSample {...props} />
    //     </div>
    //     <div {...styles.outer.behind.right}>
    //       {/* 🌳
    //           ==>> ENTRY POINT HERE: ==>>

    //           first network (explicitly chosen).
    //           TODO: expand to support different selected networks in the colleciton here

    //       */}
    //       {selectedNetwork && <DevEventList network={selectedNetwork} style={{ flex: 1 }} />}
    //     </div>
    //   </div>
    // );

    e.render(
      <div {...styles.base}>
        {/* {elBehind} */}
        <div {...outerStyle}>
          {/* <div/> */}
          <DevSample {...props} />
        </div>
      </div>,
    );
  });

export default actions;

/**
 * Helpers
 */

async function addNetwork(ctx: Ctx, redraw: () => void) {
  const network = await TEST.createNetwork();
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
