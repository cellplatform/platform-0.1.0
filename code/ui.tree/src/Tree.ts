import { TreeView } from './components/TreeView';
import { TreeEvents } from './TreeEvents';
import { TreeUtil } from './TreeUtil';
import { TreeViewState } from './state/TreeViewState';

export class Tree {
  public static View = TreeView;
  public static State = TreeViewState;
  public static events = TreeEvents;
  public static util = TreeUtil;
}
