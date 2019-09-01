import { DEFAULT, props, t } from '../common';

const SHELL = DEFAULT.STATE.SHELL;

export function create() {
  const tree = props.observable<t.IShellTreeState>(SHELL.tree);
  const body = props.observable<t.IShellBodyState>(SHELL.body);
  const sidebar = props.observable<t.IShellSidebarState>(SHELL.sidepanel);

  const model: t.IShellState = {
    tree,
    body,
    sidebar,
  };
  return model;
}
