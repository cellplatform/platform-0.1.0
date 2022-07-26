import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { Module, ModuleProps } from '..';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import { COLORS, DEFAULT, Filesystem, rx, t } from '../common';
import { DevSampleLoader } from './DEV.SampleLoader';

type Ctx = {
  props: ModuleProps;
  setUrl(url: t.ManifestUrl): void;
};

const Util = {
  debugProp(ctx: Ctx) {
    const { props } = ctx;
    return props.debug || (props.debug = {});
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus };

    const fs = ManifestSelectorStateful.DEFAULT.HISTORY.FS;
    Filesystem.IndexedDb.create({ bus, fs });

    const setUrl = (url: string) => e.change.ctx((ctx) => (ctx.props.url = url));

    const ctx: Ctx = {
      props: {
        instance,
        theme: 'Light',
        debug: Module.DEFAULT.DEBUG,
        onExportClick: ({ url }) => setUrl(url),
      },
      setUrl,
    };
    return ctx;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('props.loader:')
        .items([
          { label: `<undefined> (default:${DEFAULT.THEME})`, value: undefined },
          { label: `true`, value: true },
          { label: `false`, value: false },
          { label: `JSX.Element`, value: <DevSampleLoader /> },
        ])
        .initial(undefined)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.loader = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.select((config) => {
      config
        .title('props.theme:')
        .view('buttons')
        .items(Module.DEFAULT.THEMES.map((value) => ({ label: `theme: "${value}"`, value })))
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.select((config) => {
      config
        .title('props.info:')
        .items([
          { label: `info: <undefined>`, value: undefined },
          { label: `info: true`, value: true },
          { label: `info: false`, value: false },
        ])
        .initial(config.ctx.props.info)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.info = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.boolean('debug.logLoader', (e) => {
      const debug = Util.debugProp(e.ctx);
      if (e.changing) debug.logLoader = e.changing.next;
      e.boolean.current = debug.logLoader;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      return (
        <ManifestSelectorStateful
          instance={e.ctx.props.instance}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 30 }}
          spacing={{ infoTop: 30 }}
          focusOnLoad={true}
          autoLoadLatest={true}
          onChanged={({ url }) => {
            e.ctx.setUrl(url ?? '');
          }}
          onExportClick={({ url }) => {
            console.log('⚡️ onExportClick | url:', url);
            e.ctx.setUrl(url);
          }}
        />
      );
    });

    e.button('url: remove "?entry=<path>"', (e) => {
      const href = e.ctx.props.url;
      const url = href ? new URL(href) : undefined;
      if (url) {
        url.searchParams.delete('entry');
        e.ctx.props.url = url.href;
      }
    });

    e.hr(1, 0.1);

    e.button('url: unload', (e) => (e.ctx.props.url = undefined));
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
    const instance = e.ctx.props.instance;
    const bus = rx.bus.instance(instance.bus);

    const theme = e.ctx.props.theme ?? Module.DEFAULT.THEME;
    const isDark = theme === 'Dark';

    e.settings({
      actions: { width: 350 },
      host: { background: isDark ? COLORS.DARK : -0.04 },
      layout: {
        label: {
          topLeft: '<Module>',
          bottomLeft: e.ctx.props.url,
          bottomRight: `${bus}/id:${instance.id ?? `<none>`}`,
        },
        position: [80, 80, 110, 80],
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.5,
        background: isDark ? -0.06 : 0.1,
      },
    });
    e.render(<Module {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
