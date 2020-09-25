import * as t from '../common/types';

type N = t.ITreeNode<t.ShellProps>;

/**
 * Fluent API builder for a [Shell] module.
 */
export type IShellBuilder = {
  name(value: string): IShellBuilder;
};
