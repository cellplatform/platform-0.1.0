import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Bullet, BulletProps, BulletConstants } from '..';
import { Icons } from '../../Icons';
import { COLORS, color } from '../../common';

const { DEFAULTS } = BulletConstants;

type Ctx = {
  props: BulletProps;
  debug: { showChild: boolean; cropMarks: boolean; texture: boolean; isLight: boolean };
};

const Util = {
  size(ctx: Ctx) {
    return ctx.props.size ?? DEFAULTS.size;
  },
  reset(ctx: Ctx) {
    const props = ctx.props;
    props.size = undefined;
    props.body = undefined;
    props.outer = undefined;
    ctx.debug.isLight = true;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Bullet')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {},
      debug: { showChild: false, cropMarks: true, texture: false, isLight: true },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      const defaultLabel = `<undefined> (default: ${BulletConstants.DEFAULTS.size})`;
      config
        .title('size')
        .items([{ label: defaultLabel, value: undefined }, 5, 8, 12, 22, 60])
        .initial(config.ctx.props.size)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.size = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);
    e.title('Presets');

    e.button('reset (defaults)', (e) => Util.reset(e.ctx));

    e.button('light: white disc', (e) => {
      const { props, debug } = e.ctx;
      const size = Util.size(e.ctx);

      debug.isLight = true;
      const body = props.body || (props.body = {});
      const outer = props.outer || (props.outer = { offset: 10 });

      body.backgroundColor = 1;
      body.borderColor = color.alpha(COLORS.DARK, 0.4);
      body.radius = size;

      outer.offset = size / 2;
      outer.backgroundColor = -0.03;
      outer.borderColor = -0.02;
      outer.radius = size * 2;
      outer.backgroundBlur = 1;
    });

    e.button('dark', (e) => {
      const { props, debug } = e.ctx;
      const size = Util.size(e.ctx);

      debug.isLight = false;
      const body = props.body || (props.body = {});
      const outer = props.outer || (props.outer = { offset: 10 });

      body.backgroundColor = 0.2;
      body.borderColor = 0.3;
      body.radius = size;

      outer.offset = size / 2;
      outer.backgroundColor = 0.08;
      outer.borderColor = 0.08;
      outer.radius = size * 2;
      outer.backgroundBlur = 1;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('show: child element (body)', (e) => {
      if (e.changing) e.ctx.debug.showChild = e.changing.next;
      e.boolean.current = e.ctx.debug.showChild;
    });

    e.boolean('show: crop marks', (e) => {
      if (e.changing) e.ctx.debug.cropMarks = e.changing.next;
      e.boolean.current = e.ctx.debug.cropMarks;
    });

    e.boolean('show: background texture', (e) => {
      if (e.changing) e.ctx.debug.texture = e.changing.next;
      e.boolean.current = e.ctx.debug.texture;
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
    const debug = e.ctx.debug;
    const size = Util.size(e.ctx);
    const { isLight } = debug;

    const TEXTURE =
      'https://images.unsplash.com/photo-1521459467264-802e2ef3141f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3024&q=80';

    e.settings({
      host: {
        background: debug.texture ? `url(${TEXTURE})` : isLight ? -0.04 : COLORS.DARK,
      },
      layout: {
        cropmarks: debug.cropMarks ? (isLight ? -0.2 : 0.1) : undefined,
        labelColor: isLight ? -0.5 : 0.8,
      },
    });

    const elChild = debug.showChild && <Icons.Lock.Open size={size - 5} />;
    const el = <Bullet {...e.ctx.props}>{elChild}</Bullet>;

    e.render(el);
  });

export default actions;
