import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { ModuleAppProps } from '..';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import { Module } from '../../Module';
import { Filesystem, rx } from '../common';

type Ctx = {
  props: ModuleAppProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module.App')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus };

    const fs = ManifestSelectorStateful.DEFAULT.HISTORY.FS;
    Filesystem.IndexedDb.create({ bus, fs });

    const ctx: Ctx = {
      props: {
        instance,
        href: Module.Url.parse('https://lib.db.team').href,
        stateful: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('URL: manifest, entry');

    const hrefButton = (manifest: string, entry?: string, suffix?: string) => {
      const { href } = Module.Url.parse(manifest, { entry });

      const url = new URL(href);
      let label = `${url.host}`;
      if (entry) label += `, entry=${entry}`;
      if (suffix) label += ` ${suffix}`;
      e.button(label, (e) => (e.ctx.props.href = href));
    };

    const base = 'https://lib.db.team/index.json';
    hrefButton(base, `./net.sys`);
    hrefButton(base, `./DEV.crdt.data.sys`);
    e.hr(1, 0.1);
    hrefButton(base, undefined, '(no entry)');
    e.hr(1, 0.1);
    e.button('unload', (e) => (e.ctx.props.href = ''));

    e.hr();
  })

  .items((e) => {
    e.title('props');

    e.boolean('stateful', (e) => {
      if (e.changing) e.ctx.props.stateful = e.changing.next;
      e.boolean.current = e.ctx.props.stateful;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'context'}
          data={{
            'location.url': Module.Url.parse(location.href),
            props: e.ctx.props,
          }}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const url = Module.Url.parse(e.ctx.props.href ?? location.href);

    e.settings({
      actions: { width: 400 },
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Module.App>',
          topRight: url.href,
          bottomLeft: `manifest: ${url.manifest}`,
          bottomRight: `entry: ${url.entry ?? '<undefined>'}`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<Module.App {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
