import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { ModuleInfo, ModuleInfoProps, ModuleInfoStateful } from '..';
import { ManifestSelectorStateful } from '../../ManifestSelector';
import { t, rx } from '../../../common';

type Ctx = {
  bus: t.EventBus<any>;
  url?: string;
  props: ModuleInfoProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.ModuleInfo')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();

    const ctx: Ctx = { bus, props: {} };
    return ctx;
  })

  .items((e) => {
    e.title('Props');

    e.textbox((config) =>
      config
        .initial(config.ctx.props.title?.toString() || '')
        .placeholder('title')
        .pipe((e) => {
          if (e.changing) {
            const title = e.changing.next;
            e.textbox.current = title;
            e.ctx.props.title = title;
          }
        }),
    );

    e.hr();

    e.title('Manifest Selector');

    e.component((e) => {
      const bus = e.ctx.bus;
      return (
        <ManifestSelectorStateful
          bus={bus}
          style={{ MarginX: 15, marginTop: 10 }}
          onChanged={(event) => {
            e.change.ctx((ctx) => {
              ctx.url = event.url;
              ctx.props.manifest = event.manifest;
            });
          }}
        />
      );
    });

    e.component((e) => {
      const url = e.ctx.url;
      if (!url) return null;
      return <ModuleInfoStateful url={url} style={{ MarginX: 15, MarginY: 20 }} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<ModuleInfo {...e.ctx.props} />);
  });

export default actions;
