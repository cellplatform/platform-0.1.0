import { TreeState } from '@platform/state/lib/TreeState';
import { TreeUtil } from '../TreeUtil';
import { t } from '../common';

type N = t.ITreeviewNode;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export class TreeviewState {
  public static create<T extends N = N>(args?: t.ITreeStateArgs<T>) {
    return TreeState.create<T>(args);
  }

  public static identity = TreeState.identity;
  public static isInstance = TreeState.isInstance;
  public static children = TreeState.children;
  public static props = TreeUtil.props;
}
