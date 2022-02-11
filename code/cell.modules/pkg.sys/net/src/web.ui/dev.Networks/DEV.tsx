import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { color, DevConstants, css, t, PeerNetwork, rx } from './DEV.common';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  props: DevSampleProps;
  debug: { background: boolean };
};

const DEFAULT = {
  SIGNAL_SERVER: 'rtc.cellfs.com',
  VIEW: 'Collection',
};

const CHILD_TYPES: t.DevChildKind[] = ['None', 'Netbus', 'Crdt', 'Filesystem'];

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('dev.Networks')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        // view: DevNetworkConstants.DEFAULT.VIEW,
        // view: 'Collection',
        view: 'Single',
        child: 'Crdt',
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
        .items(DevConstants.VIEWS)
        .initial(config.ctx.props.view)
        .pipe((e) => {
          if (e.changing) e.ctx.props.view = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('child')
        .items(CHILD_TYPES)
        .initial(config.ctx.props.child)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing?.next[0].value;
            const value = !next || next === '<undefined>' ? undefined : next;
            e.ctx.props.child = value;
          }
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
      const obj = (name: string, data: any) => {
        return <ObjectView name={name} data={data} style={{ MarginX: 15 }} expandPaths={['$']} />;
      };

      const styles = {
        div: css({ height: 1, Margin: [15, 0], backgroundColor: 'rgba(255, 0, 0, 0.1)' }),
      };

      const network = e.ctx.props.view === 'Single' ? e.ctx.props.networks[0] : undefined;
      const divider = <div {...styles.div} />;

      return (
        <div>
          {obj('props', e.ctx.props)}
          {network && divider}
          {network && obj('network[0]', network)}
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
    const isUri = view === 'URI';

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        position: isCollection ? [60, 40, 80, 40] : undefined,
        background: debug.background || isCollection ? -0.1 : 0,
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
        Padding: debug.background || isCollection ? [70, 45] : undefined,
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
