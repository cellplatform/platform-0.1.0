import { t } from '../../common';
import { TreeState } from '../TreeState';

type N = t.ITreeViewNode;
type P = t.ITreeNodeProps;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export class TreeViewState {
  public static create<T extends N = N>(args: t.ITreeStateArgs<T>) {
    return TreeState.create<T>(args);
  }

  static id = TreeState.identity;
  static isInstance = TreeState.isInstance;
  static children = TreeState.children;

  static props = (of: N, fn?: (props: P) => void) => TreeState.props<P>(of, fn);
}
