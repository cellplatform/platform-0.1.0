import React from 'react';

import { DocLayout, DocLayoutProps } from '..';
import { DevActions, ObjectView, TestFilesystem } from '../../../test';
import { SAMPLE } from '../../DEV.Sample.DATA';
import { Doc } from '../../Doc';
import { t, rx, Filesystem } from '../common';

type Ctx = {
  bus: t.EventBus;
  filesystem: t.TestFilesystem;
  props: DocLayoutProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Layout')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const filesystem = TestFilesystem.init({ bus });

    const ctx: Ctx = {
      bus,
      filesystem,
      props: {
        doc: SAMPLE.defs[2],
        tracelines: false,
        scrollable: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    await ctx.filesystem.ready();
  })

  .items((e) => {
    e.title('Props');

    const defButton = (def: t.DocDef) => {
      e.button(`def: ${def.path}`, (e) => (e.ctx.props.doc = def));
    };
    SAMPLE.defs.forEach((def) => defButton(def));
    e.button('def: <undefined>', (e) => (e.ctx.props.doc = undefined));

    e.hr(1, 0.1);

    e.boolean('scrollable', (e) => {
      if (e.changing) e.ctx.props.scrollable = e.changing.next;
      e.boolean.current = e.ctx.props.scrollable;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      const instance = e.ctx.filesystem.instance;
      const id = `${instance.id}.dev`;
      return (
        <Filesystem.PathList.Dev
          instance={e.ctx.filesystem.instance}
          margin={[20, 10, 20, 10]}
          height={100}
        />
      );
    });

    e.button('[TODO] save to local fs', (e) => null);

    e.hr(1, 0.1);

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
      actions: { width: 360 },
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
