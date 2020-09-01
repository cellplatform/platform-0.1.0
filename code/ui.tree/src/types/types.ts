import { t } from './common';

type N = t.ITreeviewNode;

/**
 * Node Path
 */
export type TreeNodePathFactory<T extends N = N> = (
  id: T['id'],
  context: ITreeNodePathContext,
) => T | undefined;
export type ITreeNodePathContext = { id: string; path: string; level: number };
