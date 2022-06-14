import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { NetworkCardProps } from '..';
import { t, TEST, slug, CHILD_KINDS, rx } from './common';
import { DevNetworkCard } from './DEV.NetworkCard';

type Ctx = {
  props?: NetworkCardProps;
  debug: {
    childKind?: t.DevChildKind;
  };
};

const Util = {
  props(ctx: Ctx) {
    return ctx.props as NetworkCardProps;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.NetworkCard')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      debug: {},
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const id = `foo.${slug()}`;
    const network = await TEST.createNetwork({ bus });
    const instance = { network, id };

    ctx.props = { instance };
  })

  .items((e) => {
    e.title('props');

    e.boolean('minimized', (e) => {
      const props = Util.props(e.ctx);
      if (e.changing) props.minimized = e.changing.next;
      e.boolean.current = props.minimized;
    });
    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      config
        .view('buttons')
        // .title('ChildKind')
        .items([
          { label: 'childKind: <undefined>', value: undefined },
          ...CHILD_KINDS.map((value) => ({ label: `childKind: ${value}`, value })),
        ])
        .initial(config.ctx.debug.childKind)
        .pipe((e) => {
          if (e.changing) e.ctx.debug.childKind = e.changing?.next[0].value;
        });
    });

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
  })

  .subject((e) => {
    const { props, debug } = e.ctx;
    const instance = props?.instance;
    const network = instance?.network;
    const bus = network?.bus;
    const netbus = network?.netbus;
    const toId = rx.bus.instance;

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        label: {
          topLeft: '<NetworkCard>',
          bottomLeft: bus && netbus && instance ? `${toId(bus)} | ${toId(netbus)}` : undefined,
        },
      },
    });

    if (props) {
      e.render(
        <DevNetworkCard
          {...props}
          instance={props.instance}
          child={debug.childKind}
          onExecuteCommand={(e) => {
            console.log('⚡️ onExecuteCommand:', e);
          }}
        />,
      );
    }
  });

export default actions;
