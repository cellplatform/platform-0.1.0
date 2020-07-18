import { TreeView } from './components/TreeView';
import { TreeEvents } from './TreeEvents';
import { TreeUtil } from './TreeUtil';
import { TreeState } from './TreeState';

export class Tree {
  public static View = TreeView;
  public static State = TreeState;
  public static events = TreeEvents;
  public static util = TreeUtil;
}
