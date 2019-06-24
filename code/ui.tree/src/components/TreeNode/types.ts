import * as t from '../../common/types';

/**
 * [Events]
 */
export type TreeNodeMouseTarget = 'NODE' | 'TWISTY' | 'DRILL_IN' | 'PARENT';
export type TreeNodeMouseEvent<T extends t.ITreeNode = t.ITreeNode> = t.MouseEvent & {
  target: TreeNodeMouseTarget;
  id: T['id'];
  node: T;
  props: t.ITreeNodeProps;
  children: T[];
};
export type TreeNodeMouseEventHandler = (e: TreeNodeMouseEvent) => void;
