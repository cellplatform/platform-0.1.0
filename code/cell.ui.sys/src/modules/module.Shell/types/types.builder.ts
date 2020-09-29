import * as t from '../common/types';

/**
 * Root builder API for a [Shell].
 */
export type IShellBuilder = {
  name(value: string): IShellBuilder;
  add(module: t.IModule, within?: t.NodeIdentifier): IShellBuilderModule;
  module(id: t.NodeIdentifier): IShellBuilderModule;
};

/**
 * Builder API for a module added to a [Shell].
 */
export type IShellBuilderModule = {
  tree(): ITreeviewNodeBuilder<IShellBuilderModule>;
  parent(): IShellBuilder;
};

/**
 * Builder API for a treeview node.
 */

export type ITreeviewNodeBuilder<P> = {
  parent(): P;
  label(value: string): ITreeviewNodeBuilder<P>;
};
