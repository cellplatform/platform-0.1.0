import * as t from '../common/types';

/**
 * Root builder API for a [Shell].
 */
export type IShellBuilder = {
  name(value: string): IShellBuilder;
  modules: IShellBuilderModules;
};

/**
 * Builder API for a module added to a [Shell].
 */
export type IShellBuilderModules = {
  add(module: t.IModule): IShellBuilderModules;
};
