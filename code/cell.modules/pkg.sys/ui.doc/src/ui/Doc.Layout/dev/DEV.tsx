import React from 'react';
import { DevActions, ObjectView } from '../../../test';
import { DocLayout, DocLayoutProps } from '..';

import { SAMPLE } from '../../DEV.Sample.data';
import { t } from '../common';
import { Doc } from '../../Doc';

type Ctx = { props: DocLayoutProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Layout')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        def: SAMPLE.defs[0],
        tracelines: false,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    const defButton = (def: t.DocDef) => {
      e.button(`def: ${def.path}`, (e) => (e.ctx.props.def = def));
    };

    SAMPLE.defs.forEach((def) => defButton(def));

    e.hr(1, 0.1);
    e.button('def: <undefined>', (e) => (e.ctx.props.def = undefined));

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('tracelines', (e) => {
      if (e.changing) e.ctx.props.tracelines = e.changing.next;
      e.boolean.current = e.ctx.props.tracelines;
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
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Doc.Layout>',
        position: [80, 80, 130, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(
      <Doc.Fonts style={{ flex: 1 }}>
        <DocLayout {...e.ctx.props} style={{ flex: 1 }} />
      </Doc.Fonts>,
    );
  });

export default actions;
