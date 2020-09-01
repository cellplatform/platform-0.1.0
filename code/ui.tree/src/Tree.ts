import { Treeview } from './components/Treeview';
import { TreeviewColumns } from './components/TreeviewColumns';
import { TreeEvents } from './TreeEvents';
import { TreeUtil } from './TreeUtil';
import { TreeViewState } from './TreeviewState';
import { TreeviewStrategy } from './TreeviewStrategy';

export class Tree {
  public static View = Treeview;
  public static Columns = TreeviewColumns;
  public static State = TreeViewState;
  public static Strategy = TreeviewStrategy;
  public static Events = TreeEvents;
  public static util = TreeUtil;
}
