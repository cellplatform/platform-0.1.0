import { t } from '../common';
import { TreeState } from '../TreeState';
import { helpers } from './helpers';

type N = t.ITreeNode;

/**
 * A version of the [TreeState] configured for the base <TreeView> node type.
 */
export class TreeViewState {
  public static create<T extends N = N>(args: t.ITreeStateArgs<T>) {
    return TreeState.create<T>(args);
  }

  static id = TreeState.id;
  static isInstance = TreeState.isInstance;
  static children = TreeState.children;
  static props = helpers.props;
}
