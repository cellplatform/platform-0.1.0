import { t } from './common';

type N = t.ITreeviewNode;

/**
 * Icon
 */
export type TreeNodeIcon =
  | string // String is an ID passed to `renderIcon` factory.
  | null; //  Placeholder, no icon shown, but space taken up.

/**
 * Node Path
 */
export type TreeNodePathFactory<T extends N = N> = (
  id: T['id'],
  context: ITreeNodePathContext,
) => T | undefined;
export type ITreeNodePathContext = { id: string; path: string; level: number };
