import { t, TreeState } from '../../common';

type N = t.ITreeViewNode;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export class TreeViewState {
  public static create<T extends N = N>(args?: t.ITreeStateArgs<T>) {
    return TreeState.create<T>(args);
  }

  static identity = TreeState.identity;
  static isInstance = TreeState.isInstance;
  static children = TreeState.children;
  static props = TreeState.props;
}
