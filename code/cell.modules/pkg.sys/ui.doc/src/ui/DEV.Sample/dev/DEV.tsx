import React from 'react';
import { DevActions, ObjectView } from '../../../test';
import { App, AppProps } from '..';
import { t, rx } from '../common';
import { SAMPLE } from '../../DEV.Sample.DATA';

type Ctx = {
  href?: string;
  route?: t.RouteEvents;
  props: AppProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Sample.App')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        bus: rx.bus(),
        onReady(e) {
          change.ctx((ctx) => (ctx.route = e.route));
          e.route.current.$.subscribe((e) => change.ctx((ctx) => (ctx.href = e.info.url.href)));
        },
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Routes');

    const route = (path: string) => {
      const label = `url: ${path}`;
      e.button(label, (e) => e.ctx.route?.change.fire({ path }));
    };

    route('/');
    e.hr(1, 0.1);
    SAMPLE.defs.forEach((def) => route(def.path));

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

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
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Sample.App>',
          bottomLeft: e.ctx.href,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
      },
    });
    e.render(<App {...e.ctx.props} mock={true} style={{ flex: 1 }} />);
  });

export default actions;
