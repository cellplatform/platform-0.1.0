import { TreeView } from './components/TreeView';
import { TreeEvents } from './TreeEvents';
import { TreeUtil } from './TreeUtil';

export class Tree {
  public static View = TreeView;
  public static events = TreeEvents;
  public static util = TreeUtil;
}
