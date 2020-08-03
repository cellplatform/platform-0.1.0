import * as t from '../common/types';

type O = Record<string, unknown>;
type Event = t.Event<O>;

export type ModuleArgs<D extends O> = t.ITreeStateArgs<ITreeNodeModule<D>>;

export type Module = {
  create<D extends O, A extends Event = any>(args?: ModuleArgs<D>): IModule<D, A>;
};

/**
 * A module state-tree.
 */
export type IModule<D extends O = O, A extends Event = any> = t.ITreeState<
  ITreeNodeModule<D>,
  t.ModuleEvent | A
>;

/**
 * A tree-node that contains details about a module.
 */
export type ITreeNodeModule<D extends O> = t.ITreeNode<
  t.ITreeNodePropsTreeView & t.ITreeNodePropsModule<D>
>;

/**
 * The way a module is expressed as props within a tree-node.
 */
export type ITreeNodePropsModule<D extends O = O> = {
  data: D;
  view: string;
};

/**
 * Render (factory)
 */
export type ModuleRender<D extends O = any, A extends Event = any> = (
  args: ModuleRenderArgs<D, A>,
) => ModuleRenderResponse;

export type ModuleRenderArgs<D extends O, A extends Event = any> = {
  module: IModule<D, A>;
  data: D;
  view: string;
};
export type ModuleRenderResponse = JSX.Element | undefined | void;

/**
 * [Events]
 */

export type ModuleEvent = IModuleRegisterEvent;

export type IModuleRegisterEvent = {
  type: 'MODULE/register';
  payload: IModuleRegister;
};
export type IModuleRegister = {
  id: string;
  name: string;
};
