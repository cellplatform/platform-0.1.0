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
        href: Module.Url.parseUrl('https://lib.db.team').href,
        stateful: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('URL');
    e.markdown(`
The input URL specifies the HTTP endpoint of the \`module\` bundle 
and optionally the \`entry\` function (ƒ).
`);
    e.hr(1, 0.1);

    const hrefButton = (manifest: string, entry?: string, suffix?: string) => {
      const { href } = Module.Url.parseUrl(manifest, { entry });

      const url = new URL(href);
      let label = `${url.host}`;
      if (entry) label += `, entry=${entry}`;
      if (suffix) label += ` ${suffix}`;
      e.button(label, (e) => (e.ctx.props.href = href));
    };

    hrefButton('https://lib.db.team', './net.sys');
    hrefButton('https://lib.db.team', './DEV.fs.sys');
    hrefButton('https://lib.db.team', './DEV.crdt.data.sys');
    hrefButton('https://lib.db.team');
    e.hr(1, 0.1);

    hrefButton('https://runtime.db.team');
    hrefButton('https://runtime.db.team', `./Dev`);
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
            'location.url': Module.Url.parseUrl(location.href),
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
    const url = Module.Url.parseUrl(e.ctx.props.href ?? location.href);

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
