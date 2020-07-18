import { t } from '../common';

/**
 * State machine for programming a tree,
 * or partial leaf within a tree.
 */
export class TreeState implements t.ITreeState {
  public static create() {
    return new TreeState();
  }

  /**
   * Lifecycle
   */
  private constructor() {
    //
  }
}
