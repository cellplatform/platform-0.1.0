import React from 'react';
import { Subject } from 'rxjs';
import { DevActions } from 'sys.ui.dev';

import { Tree } from '..';
import { COLORS, Icons, rx, t } from './common';
import { COMPREHENSIVE } from './sample';
import { useSample } from './hooks';

type E = t.TreeviewEvent;
type DebugStateStrategy = 'none' | 'useSample';

type Ctx = {
  bus: t.EventBus<E>;
  debug: { stateStrategy: DebugStateStrategy };
  props: t.ITreeviewProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Tree')
  .context((e) => {
    if (e.prev) return e.prev;

    const event$ = new Subject<E>();
    const bus = rx.bus<E>(event$);

    const ctx: Ctx = {
      bus,
      debug: { stateStrategy: 'useSample' },
      props: {
        theme: 'LIGHT',
        // root: COMPREHENSIVE,
        event$,
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Debug');

    e.select((config) => {
      const items: DebugStateStrategy[] = ['none', 'useSample'];
      config
        .title('state strategy')
        .items(items)
        .initial(config.ctx.debug.stateStrategy)
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value as DebugStateStrategy; // NB: always first.
          if (e.changing) e.ctx.debug.stateStrategy = value;
        });
    });

    e.select((config) => {
      config
        .title('theme')
        .items(['LIGHT', 'DARK'])
        .initial((config.ctx.props.theme as string) ?? 'LIGHT')
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value; // NB: always first.
          if (e.changing) e.ctx.props.theme = value;
        });
    });

    e.select((config) => {
      config
        .title('background')
        .items(['NONE', 'THEME'])
        .initial((config.ctx.props.background as string) ?? 'THEME')
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value; // NB: always first.
          if (e.changing) e.ctx.props.background = value;
        });
    });

    e.hr();
  })

  .subject((e) => {
    const theme = e.ctx.props.theme ?? 'LIGHT';
    const isDark = theme === 'DARK';

    e.settings({
      host: { background: isDark ? COLORS.DARK : -0.04 },
      layout: {
        label: '<TreeView>',
        position: [150, null],
        width: 300,
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.7,
      },
    });

    e.render(<Sample ctx={e.ctx} />);
  });

export default actions;

/**
 * [Helpers]
 */

export type SampleProps = { ctx: Ctx };
export const Sample: React.FC<SampleProps> = (props) => {
  const { ctx } = props;
  const { bus, debug } = ctx;

  const sample = useSample({ bus, isEnabled: debug.stateStrategy === 'useSample' });
  const root = sample.root;
  const current = sample.current;

  return <Tree.View {...ctx.props} root={root} current={current} renderIcon={renderIcon} />;
};

const renderIcon: t.RenderTreeIcon = (e) => {
  if (e.icon === 'Face') {
    return Icons[e.icon];
  } else {
    // NB: This arbitrary IF statement is to allow the
    //     event factory "TREEVIEW/render/icon" to be tested.
    return undefined;
  }
};
