import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { LoadMask, LoadMaskProps } from '..';
import { COLORS, css, Color, DEFAULT } from '../common';

type Ctx = {
  props: LoadMaskProps;
  debug: { picture: boolean };
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
        theme: 'Light',
        spinner: true,
        outerTile: true,
        blur: DEFAULT.BLUR,
      },
      debug: { picture: true },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .view('buttons')
        .items(LoadMask.DEFAULT.THEMES.map((value) => ({ label: `theme: ${value}`, value })))
        .initial(config.ctx.props.theme)
        .pipe((e) => {
          if (e.changing) e.ctx.props.theme = e.changing?.next[0].value;
        });
    });

    e.boolean('spinner', (e) => {
      if (e.changing) e.ctx.props.spinner = e.changing.next;
      e.boolean.current = e.ctx.props.spinner;
    });

    e.boolean('outerTile', (e) => {
      if (e.changing) e.ctx.props.outerTile = e.changing.next;
      e.boolean.current = e.ctx.props.outerTile;
    });

    e.boolean('blur', (e) => {
      if (e.changing) e.ctx.props.blur = e.changing.next ? DEFAULT.BLUR : 0;
      e.boolean.current = Boolean(e.ctx.props.blur);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('show picture', (e) => {
      if (e.changing) e.ctx.debug.picture = e.changing.next;
      e.boolean.current = e.ctx.debug.picture;
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
    const { props, debug } = e.ctx;

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

    const src =
      'https://images.unsplash.com/photo-1511798616182-aab3698ac53e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2176&q=80';

    const styles = {
      base: css({ flex: 1, position: 'relative' }),
      picture: css({
        Absolute: 0,
        backgroundImage: `url(${src})`,
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
