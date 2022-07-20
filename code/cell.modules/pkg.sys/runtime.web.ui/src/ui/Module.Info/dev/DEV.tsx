import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { ModuleInfo, ModuleInfoProps } from '..';
import { Filesystem, rx, t, COLORS } from '../common';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import * as k from '../types';

type Id = string;
type Ctx = {
  instance: { bus: t.EventBus; id?: Id };
  props: ModuleInfoProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module.Info')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus };

    Filesystem.IndexedDb.create({
      bus,
      fs: ManifestSelectorStateful.DEFAULT.HISTORY.FS,
    });

    const ctx: Ctx = {
      instance,
      props: {
        width: 300,
        theme: ModuleInfo.DEFAULT.THEME,
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('empty = null', (e) => {
      if (e.changing) e.ctx.props.empty = e.changing.next ? null : undefined;
      e.boolean.current = e.ctx.props.empty === null;
    });

    e.boolean('width', (e) => {
      if (e.changing) e.ctx.props.width = e.changing.next ? 300 : undefined;
      e.boolean.current = e.ctx.props.width !== undefined;
    });

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

    e.select((config) => {
      config
        .title('props.theme:')
        .view('buttons')
        .items(ModuleInfo.DEFAULT.THEMES.map((value) => ({ label: `theme: "${value}"`, value })))
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.select((config) =>
      config
        .title('fields:')
        .items(ModuleInfo.FIELDS)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as k.ModuleInfoFields[];
            e.ctx.props.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();

    e.title('Manifest Selector');

    e.component((e) => {
      return (
        <ManifestSelectorStateful
          instance={e.ctx.instance}
          showExports={false}
          focusOnLoad={true}
          autoLoadLatest={true}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 40 }}
          onChanged={(event) => {
            e.change.ctx((ctx) => {
              ctx.props.url = event.url;
              ctx.props.manifest = event.manifest;
            });
          }}
        />
      );
    });

    e.hr();

    e.button('clear (url, manifest)', (e) => {
      e.ctx.props.url = undefined;
      e.ctx.props.manifest = undefined;
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
    const theme = e.ctx.props.theme ?? ModuleInfo.DEFAULT.THEME;
    const isDark = theme === 'Dark';

    e.settings({
      actions: { width: 400 },
      host: { background: isDark ? COLORS.DARK : -0.04 },
      layout: {
        border: 0,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.5,
      },
    });

    const el = (
      <ModuleInfo {...e.ctx.props} onExportClick={(e) => console.log('onExportClick', e)} />
    );

    e.render(el);
  });

export default actions;
