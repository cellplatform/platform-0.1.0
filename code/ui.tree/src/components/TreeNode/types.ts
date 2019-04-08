import { MouseEvent } from '@platform/react';

import * as t from '../../types';

/**
 * [Events]
 */
export type TreeNodeMouseEvent<T extends t.ITreeNode = t.ITreeNode> = MouseEvent & {
  target: 'NODE' | 'TWISTY' | 'DRILL_IN' | 'PARENT';
  id: T['id'];
  node: T;
  props: t.ITreeNodeProps;
  children: T[];
};
export type TreeNodeMouseEventHandler = (e: TreeNodeMouseEvent) => void;
