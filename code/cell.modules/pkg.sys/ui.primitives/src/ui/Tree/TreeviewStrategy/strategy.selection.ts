import { color } from '@platform/css';
import { rx } from '@platform/util.value';

import { COLORS, t } from '../common';
import * as util from './util';

export const selection: t.TreeviewStrategySelection = (args) => {
  const { events, treeview$ } = util.options();

  let tree: t.ITreeviewState;
  const strategy: t.ITreeviewStrategy = {
    /**
     * NB: The [tree] is stored temporarily so that the handlers below can be
     *     setup using just simple observable description, and the [tree]
     *     state is essentially beign "injected" in via this call prior to
     *     them running.
     */
    next(e) {
      tree = e.tree;
      treeview$.next(e.event);
    },
  };

  const current = () => util.current(tree);
  const rootNav = () => tree?.state.props?.treeview?.nav || {};

  /**
   * Adjust styles on node selection
   */
  events.beforeRender.node$.subscribe((e) => {
    const isSelected = e.node.id === rootNav().selected;
    if (isSelected) {
      e.change((props) => {
        const colors = props.colors || (props.colors = {});

        const foregroundDefault = args.color || undefined;
        const foregroundFocused = args.colorFocused || COLORS.BLUE;
        const foreground = color.format(e.isFocused ? foregroundFocused : foregroundDefault);

        const bgDefault = args.bg || -0.03;
        const bgFocused = args.bgFocused || -0.05;
        const bg = color.format(e.isFocused ? bgFocused : bgDefault);

        colors.label = foreground;
        colors.icon = foreground;
        colors.bg = bg;
      });
    }
  });

  /**
   * Listen for selection requests.
   */
  rx.payload<t.ITreeviewSelectEvent>(events.$, 'TREEVIEW/select')
    .pipe()
    .subscribe((e) => {
      const { mutate } = current();

      if (e.selected || e.selected === null) {
        // NB: Reset to [undefined] if [null] was broadcast.
        const value = e.selected === null ? undefined : e.selected;
        mutate.selected(value);
      }

      if (e.current || e.current === null) {
        // NB: Reset to [undefined] if [null] was broadcast.
        const value = e.current === null ? undefined : e.current;
        mutate.current(value);
      }
    });

  // Finish up.
  return strategy;
};
