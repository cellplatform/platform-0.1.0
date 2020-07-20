import { t } from './common';

type N = t.ITreeViewNode;

/**
 * Arguments for walking a tree (top-down).
 */
export type ITreeDescend<T extends N = N> = {
  index: number; // Within siblings.
  node: T;
  parent?: T;
  depth: number;
  stop(): void;
  skip(): void; // Skip children.
};

/**
 * Arguments for walking a tree (bottom up).
 */
export type ITreeAscend<T extends N = N> = {
  index: number; // Within siblings.
  node: T;
  parent?: T;
  stop(): void;
};
