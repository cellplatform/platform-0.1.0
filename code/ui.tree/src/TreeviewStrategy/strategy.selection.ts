import { COLORS, t } from '../common';
import * as util from './util';

export const selection: t.TreeviewStrategySelection = (args = {}) => {
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

  const rootNav = () => tree?.root.props?.treeview?.nav || {};

  /**
   * Adjust styles on node selection
   */
  events.beforeRender.node$.subscribe((e) => {
    const isSelected = e.node.id === rootNav().selected;
    if (isSelected) {
      e.change((props) => {
        const colors = props.colors || (props.colors = {});
        const color = args.color || COLORS.BLUE;
        colors.label = color;
        colors.icon = color;
      });
    }
  });

  // Finish up.
  return strategy;
};
