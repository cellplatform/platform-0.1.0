import * as t from '../../common/types';

export type ITreeNodeBounds = {
  node: string;
  target: 'ROOT' | 'CONTENT' | 'LABEL';
  width: number;
  height: number;
  left: number;
  top: number;
};

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
