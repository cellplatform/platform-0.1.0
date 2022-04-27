import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Photo, PhotoProps } from '..';
import { DevSample } from './DEV.Sample';
import { deleteUndefined } from '../common';

type Milliseconds = number;

type Ctx = {
  props: PhotoProps;
  debug: {
    indexTimer: { enabled: boolean; loop: boolean };
    durationOnItem: boolean;
  };
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

  push(ctx: Ctx, args: { url: string; duration?: Milliseconds }) {
    const { url } = args;
    const defs = Photo.toDefs(ctx.props.def);

    let duration = args.duration;
    if (typeof duration !== 'number' && ctx.debug.durationOnItem) duration = 1000;

    defs.push(deleteUndefined({ url, duration }));
    ctx.props.def = defs; // NB: As [list].
  },

  add: {
    fromList(ctx: Ctx) {
      const defs = Photo.toDefs(ctx.props.def);
      if (defs.length < URLS.length) {
        Util.push(ctx, { url: URLS[defs.length] });
      }
    },

    fromUrl(ctx: Ctx, url: string) {
      Util.push(ctx, { url });
    },
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
        onLoaded: (e) => console.log('⚡️ onLoaded:', e),
      },
      debug: {
        indexTimer: { enabled: true, loop: true },
        durationOnItem: false,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    // ctx.props.def = URLS[0];
    Util.add.fromList(ctx);
    Util.add.fromList(ctx);
  })

  .items((e) => {
    e.title('Props');

    e.boolean('defaults.meta.showUrl', (e) => {
      const meta = Util.toDefaults(e.ctx);
      if (e.changing) meta.showUrl = e.changing.next;
      e.boolean.current = meta.showUrl;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Items (defs)');

    e.button('add photo', (e) => {
      Util.add.fromList(e.ctx);
    });
    e.button('add 404 (not found)', (e) => {
      Util.add.fromUrl(e.ctx, 'https://domain.com/404.png');
    });
    e.button('add /static', (e) => {
      Util.add.fromUrl(e.ctx, '/static/images/sample/kitten.png');
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
      return (
        <Photo.Debug.DefsSelector
          {...e.ctx.props}
          style={{ MarginX: 20, MarginY: 15 }}
          onSelectionChange={({ to }) => e.change.ctx((ctx) => (ctx.props.index = to))}
        />
      );
    });

    e.hr(1, 0.1);

    e.boolean('duration on item (def)', (e) => {
      if (e.changing) e.ctx.debug.durationOnItem = e.changing.next;
      e.boolean.current = e.ctx.debug.durationOnItem;
    });

    e.hr();

    e.boolean('useIndexTimer: enabled', (e) => {
      if (e.changing) e.ctx.debug.indexTimer.enabled = e.changing.next;
      e.boolean.current = e.ctx.debug.indexTimer.enabled;
    });

    e.boolean('useIndexTimer: loop', (e) => {
      if (e.changing) e.ctx.debug.indexTimer.loop = e.changing.next;
      e.boolean.current = e.ctx.debug.indexTimer.loop;
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={Util.toProps(e.ctx)}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const props = Util.toProps(e.ctx);
    const debug = e.ctx.debug;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Photo>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
      },
    });

    e.render(<DevSample props={props} indexTimer={debug.indexTimer} />);
  });

export default actions;
