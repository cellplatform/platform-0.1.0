import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { LoadMask, LoadMaskProps } from '..';
import { COLORS, css, DEFAULT, t } from '../common';
import { PropList } from '../../PropList';

type Ctx = {
  props: LoadMaskProps;
  debug: {
    bg: { rollup: boolean };
    tile: { rollup: boolean; custom: boolean };
    picture?: string;
  };
};

const IMAGE = {
  'sample-1':
    'https://images.unsplash.com/photo-1512998844734-cd2cca565822?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1621&q=80',
  'sample-2':
    'https://images.unsplash.com/photo-1511798616182-aab3698ac53e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2176&q=80',
};

const Util = {
  toProps(ctx: Ctx) {
    const { debug } = ctx;
    const props = { ...ctx.props };
    if (debug.bg.rollup) props.bg = true;
    if (debug.tile.rollup) props.tile = true;
    if (!debug.tile.rollup && debug.tile.custom) {
      props.tile = {
        el: Util.renderPropList(ctx),
        padding: [30, 50],
        backgroundColor: 'rgba(255, 0, 0, 0.15)',
      };
    }
    return props;
  },

  toBgProp(ctx: Ctx) {
    if (!ctx.props.bg) ctx.props.bg = LoadMask.toBgProp(ctx.props.bg);
    return ctx.props.bg as t.LoadMaskBgProp;
  },

  toTileProp(ctx: Ctx) {
    if (!ctx.props.tile) ctx.props.tile = LoadMask.toTileProp(ctx.props.tile);
    return ctx.props.tile as t.LoadMaskTileProp;
  },

  renderPropList(ctx: Ctx) {
    return (
      <PropList
        style={{ marginTop: ctx.props.spinner ? 18 : 0 }}
        theme={ctx.props.theme}
        width={{ min: 120 }}
        items={[
          { label: 'hello', value: 'world!' },
          { label: 'foo', value: 123 },
          { label: 'bar', value: 456 },
        ]}
      />
    );
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.LoadMask')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        theme: 'Dark',
        spinner: true,
        tile: true,
        bg: DEFAULT.MASK,
      },
      debug: {
        picture: IMAGE['sample-2'],
        bg: { rollup: false },
        tile: { rollup: false, custom: false },
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    const theme = (theme: t.LoadMaskTheme) => {
      e.button(`theme: "${theme}"`, (e) => (e.ctx.props.theme = theme));
    };
    theme('Light');
    theme('Dark');
    e.hr(1, 0.1);

    e.boolean('spinner', (e) => {
      if (e.changing) e.ctx.props.spinner = e.changing.next;
      e.boolean.current = e.ctx.props.spinner;
    });

    e.hr(1, 0.1);

    e.boolean('tile: rollup (boolean)', (e) => {
      if (e.changing) e.ctx.debug.tile.rollup = e.changing.next;
      e.boolean.current = Boolean(e.ctx.debug.tile.rollup);
    });

    e.boolean('tile: {custom}', (e) => {
      if (e.changing) e.ctx.debug.tile.custom = e.changing.next;
      e.boolean.current = Boolean(e.ctx.debug.tile.custom);
    });

    e.hr(1, 0.1);

    e.boolean('bg: rollup (boolean)', (e) => {
      if (e.changing) e.ctx.debug.bg.rollup = e.changing.next;
      e.boolean.current = e.ctx.debug.bg.rollup;
    });

    e.boolean('bg.blur', (e) => {
      const bg = Util.toBgProp(e.ctx);
      if (e.changing) bg.blur = e.changing.next ? DEFAULT.MASK.blur : 0;
      e.boolean.current = Boolean(bg.blur);
    });

    e.boolean('bg.color (sample)', (e) => {
      const bg = Util.toBgProp(e.ctx);
      if (e.changing) bg.color = e.changing.next ? 'rgba(255, 0, 0, 0.3)' : 0;
      e.boolean.current = Boolean(bg.color);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    const picture = (key: keyof typeof IMAGE, theme: t.LoadMaskTheme) => {
      e.button(`picture: ${key} (${theme})`.trim(), (e) => {
        e.ctx.debug.picture = IMAGE[key];
        e.ctx.props.theme = theme;
      });
    };

    picture('sample-1', 'Light');
    picture('sample-2', 'Dark');
    e.button('picture: <none>', (e) => (e.ctx.debug.picture = undefined));

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
    const { debug } = e.ctx;
    const props = Util.toProps(e.ctx);

    const theme = props.theme ?? LoadMask.DEFAULT.THEME;
    const isDark = theme === 'Dark';

    e.settings({
      host: { background: isDark ? COLORS.DARK : -0.04 },
      layout: {
        label: '<LoadMask>',
        position: [150, 80],
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.5,
        background: isDark ? -0.06 : 0.1,
      },
    });

    const styles = {
      base: css({ flex: 1, position: 'relative' }),
      picture:
        debug.picture &&
        css({
          Absolute: 0,
          backgroundImage: `url(${debug.picture})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }),
    };

    e.render(
      <div {...styles.base}>
        {debug.picture && <div {...styles.picture} />}
        <LoadMask {...props} style={{ Absolute: 0 }} />
      </div>,
    );
  });

export default actions;
