import { Treeview } from './components/Treeview';
import { TreeEvents } from './TreeEvents';
import { TreeUtil } from './TreeUtil';
import { TreeViewState } from './TreeviewState';

export class Tree {
  public static View = Treeview;
  public static State = TreeViewState;
  public static events = TreeEvents;
  public static util = TreeUtil;
}
