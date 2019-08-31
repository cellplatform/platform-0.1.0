import { props, t } from '../common';

export function create() {
  const body = props.observable<t.IShellBodyState>({ el: undefined });
  const sidepanel = props.observable<t.IShellSidepanelState>({ el: undefined });
  const tree = props.observable<t.IShellTreeState>({ root: undefined, current: undefined });

  const model: t.IShellState = {
    tree,
    body,
    sidepanel,
  };
  return model;
}
