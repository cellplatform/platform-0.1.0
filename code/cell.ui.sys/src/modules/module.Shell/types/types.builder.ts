import * as t from '../common/types';

/**
 * Root builder API for a [Shell].
 */
export type IShellBuilder = {
  name(value: string): IShellBuilder;
  add(module: t.IModule, within?: t.NodeIdentifier): IShellBuilder;
};

/**
 * Builder API for a module added to a [Shell].
 */
// export type IShellBuilderModules = {
//   add(module: t.IModule, within: t.NodeIdentifier): IShellBuilderModules;
// };
