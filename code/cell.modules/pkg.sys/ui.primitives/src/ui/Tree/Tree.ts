import { Treeview } from './components/Treeview';
import { TreeviewColumns } from './components/TreeviewColumns';
import { TreeEvents } from './TreeviewEvents';
import { TreeUtil as Util } from './TreeUtil';
import { TreeviewState } from './TreeviewState';
import { TreeviewStrategy } from './TreeviewStrategy';
import { TreeHooks as Hooks } from './Hooks';

export const Tree = {
  View: Treeview,
  Columns: TreeviewColumns,
  State: TreeviewState,
  Strategy: TreeviewStrategy,
  Events: TreeEvents,
  Util,
  Hooks,
};

export default Tree;
