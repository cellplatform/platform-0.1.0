import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { NetworkCard, NetworkCardProps } from '..';
import { t, TEST, slug, CHILD_KINDS } from './DEV.common';
// import { useDevController } from './DEV.useController';
// import { DevCardPlaceholder } from './DEV.Card.Placeholder';
// import { DevChild } from './DEV.Child';
import { DevNetworkCard } from './DEV.NetworkCard';

type Ctx = {
  props?: NetworkCardProps;
  debug: {
    childKind?: t.DevChildKind;
  };
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
    e.title('Dev');

    e.select((config) => {
      config
        .view('buttons')
        .title('ChildKind')
        .items([{ label: '<undefined> (use controller)', value: undefined }, ...CHILD_KINDS])
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

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<NetworkCard>',
        cropmarks: -0.2,
      },
    });

    e.render(props && <DevNetworkCard instance={props.instance} child={debug.childKind} />);
  });

export default actions;
