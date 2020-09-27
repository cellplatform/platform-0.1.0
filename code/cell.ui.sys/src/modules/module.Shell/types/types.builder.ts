import * as t from '../common/types';

type N = t.ITreeNode<t.ShellProps>;

/**
 * Root builder API for a [Shell].
 */
export type IShellBuilder = {
  name(value: string): IShellBuilder;
  module: t.BuilderListByName<IShellBuilderModule>;
};

/**
 * Builder API for a module added to a [Shell].
 */
export type IShellBuilderModule = {
  //
};
