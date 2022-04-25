import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Photo, PhotoProps } from '..';

type Ctx = {
  props: PhotoProps;
};

const URLS = [
  'https://source.unsplash.com/ntqaFfrDdEA/1920x1280',
  'https://source.unsplash.com/wdIEebx7SSs/1920x1280',
  'https://source.unsplash.com/03Pv2Ikm5Hk/1920x1280',
  'https://source.unsplash.com/1OtUkD_8svc/1920x1280',
  'https://source.unsplash.com/nKNm_75lH4g/1920x1280',
  'https://source.unsplash.com/MljwsnGwdOY/1920x1280',
  'https://source.unsplash.com/JZRlnfsdcj0/1920x1280',
  'https://source.unsplash.com/ycG0A6DlvOk/1920x1280',
];

const Util = {
  toProps(ctx: Ctx) {
    const props = { ...ctx.props };
    return props;
  },

  toDefaults(ctx: Ctx) {
    return ctx.props.defaults || (ctx.props.defaults = {});
  },

  toDefs(ctx: Ctx) {
    return [...Photo.toDefs(ctx.props.def)];
  },

  addPhoto(ctx: Ctx) {
    const defs = Photo.toDefs(ctx.props.def);
    if (defs.length < URLS.length) {
      const url = URLS[defs.length];
      defs.push({ url });
      ctx.props.def = defs; // NB: As [list].
    }
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Photo')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        defaults: { showUrl: true },
        onLoaded(e) {
          console.log('⚡️ onLoaded:', e);
        },
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    ctx.props.def = URLS[0];
  })

  .items((e) => {
    e.title('Props');

    // e.button('meta.url', (e) => Util.toMeta(e.ctx).showUrl);

    e.boolean('defaults.meta.showUrl', (e) => {
      const meta = Util.toDefaults(e.ctx);
      if (e.changing) meta.showUrl = e.changing.next;
      e.boolean.current = meta.showUrl;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Def (Items)');

    e.button('add photo', (e) => Util.addPhoto(e.ctx));
    e.button('add 404 (fail)', (e) => {
      const defs = Photo.toDefs(e.ctx.props.def);
      defs.push({ url: 'https://domain.com/404.png' });
      e.ctx.props.def = defs; // NB: As [list].
    });

    e.hr(1, 0.1);

    e.button('remove (first)', (e) => {
      const defs = Photo.toDefs(e.ctx.props.def);
      e.ctx.props.def = defs.slice(1);
    });

    e.button('remove (last)', (e) => {
      const defs = Photo.toDefs(e.ctx.props.def);
      e.ctx.props.def = defs.slice(0, defs.length - 1);
    });

    e.hr(1, 0.1);

    e.button('clear', (e) => {
      e.ctx.props.def = undefined;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.component((e) => {
      const change = e.change;
      return (
        <Photo.Debug.DefsSelector
          {...e.ctx.props}
          style={{ MarginX: 20, MarginY: 15 }}
          onSelectionChange={(e) => {
            change.ctx((ctx) => (ctx.props.index = e.to));
          }}
        />
      );
    });

    e.hr();

    e.component((e) => {
      const props = Util.toProps(e.ctx);
      return (
        <ObjectView
          name={'props'}
          data={props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const props = Util.toProps(e.ctx);

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Photo>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
      },
    });

    e.render(<Photo {...props} style={{ flex: 1 }} />);
  });

export default actions;
