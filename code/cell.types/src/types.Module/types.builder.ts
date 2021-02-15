import { t } from '../common';
import { Observable } from '../common/types';

type O = Record<string, unknown>;

export type BuilderNamedItem = { name: string };
export type BuilderIndexParam = BuilderIndexEdge | number | BuilderIndexCalc;
export type BuilderIndexEdge = 'END' | 'START';
export type BuilderIndexCalc = (args: BuilderIndexCalcArgs) => number;
export type BuilderIndexCalcArgs = { total: number; list: any[] };

/**
 * Static builder methods.
 */
export type Builder = {
  create: BuilderChainFactory;
  format: t.BuilderFormat;
  isBuilder(input?: any): boolean;
};
export type BuilderChain<F extends O> = F & t.IDisposable;

/**
 * Model/State
 * NB:
 *    This is a slimmed down version of an [IStateObjectWritable] type.
 */
export type BuilderModel<M extends O> = {
  state: M;
  change: BuilderModelChange<M>;
  changeAsync: BuilderModelChangeAsync<M>;
  event: t.IStateObjectEvents<M>;
};
export type BuilderModelChange<M extends O> = (
  fn: (draft: M) => void,
) => BuilderModelChangeResponse<M>;

export type BuilderModelChangeAsync<M extends O> = (
  fn: (draft: M) => Promise<void>,
) => Promise<BuilderModelChangeResponse<M>>;

export type BuilderModelChangeResponse<M extends O> = t.IStateObjectChangeResponse<M>;

/**
 * API Handlers
 */
export type BuilderHandlers<M extends O, F extends O> = {
  [K in keyof F]: BuilderHandler<M, F> | BuilderChild;
};

export type BuilderHandler<M extends O, F extends O> = (args: BuilderHandlerArgs<M, F>) => any;
export type BuilderHandlerArgs<M extends O, F extends O> = {
  kind: BuilderMethodKind;
  key: string;
  path: string;
  index: number; // NB: -1 if not relevant (ie. not related to an array-list).
  params: any[];
  builder: { self: BuilderChain<F>; parent?: BuilderChain<any>; dispose$: Observable<void> };
  is: { list: boolean; map: boolean };
  model: BuilderModel<M>;
  clone(props?: Partial<M>): t.BuilderChain<F>;
};
export type BuilderMethodKind = 'ROOT' | BuilderChild['kind'];
export type BuilderMethodKindList = BuilderListByIndexDef['kind'] | BuilderListByNameDef['kind'];
export type BuilderMethodKindObject = BuilderObjectDef['kind'] | BuilderMapDef['kind'];

export type BuilderGetHandlers<M extends O, F extends O> = (
  args: BuilderGetHandlersArgs,
) => BuilderHandlers<M, F>;
export type BuilderGetHandlersArgs = {
  path: string;
  index: number;
};

/**
 * Children
 */
export type BuilderChild =
  | BuilderObjectDef
  | BuilderMapDef
  | BuilderListByIndexDef
  | BuilderListByNameDef;

/**
 * Child: OBJECT
 *        A simple child object which is not part of a [list] or {map}.
 */
export type BuilderObjectDef = {
  kind: 'object';
  path?: string;
  builder: BuilderMapFactory<any, any>;
  default?: () => O;
};

export type BuilderListDef = BuilderListByIndexDef | BuilderListByNameDef;

/**
 * Child: LIST
 *        A child that is indexed within a list (array) on the parent.
 *
 * Assumes a consuming method of type [BuilderListByIndex]:
 *
 *        obj.method(index?: number)
 *
 */
export type BuilderListByIndexDef = {
  kind: 'list:byIndex';
  path: string; // [JsonPath] to location in model.
  builder: BuilderListFactory<any, any>;
  default?: () => O;
};
export type BuilderListByIndex<T> = (index?: BuilderIndexParam) => T;

/**
 * Child: LIST
 *        A child that is named within a list (array) on the parent.
 *
 * Assumes a consuming method of type [BuilderListByName] on the parent:
 *
 *        parent.method(name: string, index?: number) => child
 *
 * and a [name] method on the returned child:
 *
 *        child.name(name: string) => child
 *
 * and that the items within the stored array data implement the [BuilderNamedItem] interface:
 *
 *        { name: 'foo' }
 *
 */
export type BuilderListByNameDef = {
  kind: 'list:byName';
  path: string; // [JsonPath] to location in model.
  builder: BuilderListFactory<any, any>;
  default?: () => O;
};
export type BuilderListByName<T, N = string> = (name: N, index?: BuilderIndexParam) => T;

/**
 * Child: MAP
 *        A child that is keyed within an object-map on the parent.
 */
export type BuilderMapDef = {
  kind: 'map';
  path?: string; // [JsonPath] to location in model.
  builder: BuilderMapFactory<any, any>;
  default?: () => O;
};
export type BuilderMap<T, K = string, F extends O = O> = (key: K, args?: F) => T;

/**
 * FACTORY: Chain builder
 */
export type BuilderChainFactory = <M extends O, F extends O>(
  args: BuilderChainFactoryArgs<M, F>,
) => BuilderChain<F>;
export type BuilderChainFactoryArgs<M extends O, F extends O> = {
  model: BuilderModel<M>;
  handlers: BuilderHandlers<M, F>;
  parent?: BuilderChain<any>;
};

/**
 * FACTORY: Child builders
 */
export type BuilderMapFactory<M extends O, F extends O> = (
  args: BuilderMapFactoryArgs<M, F>,
) => BuilderChain<F>;
export type BuilderMapFactoryArgs<M extends O, F extends O> = BuilderChildFactoryArgs<M, F> & {
  key: string;
};

export type BuilderListFactory<M extends O, F extends O> = (
  args: BuilderListFactoryArgs<M, F>,
) => BuilderChain<F>;
export type BuilderListFactoryArgs<M extends O, F extends O> = BuilderChildFactoryArgs<M, F> & {
  index: number;
  name: string;
};

export type BuilderChildFactoryArgs<
  M extends O,
  F extends O // eslint-disable-line
> = {
  params: any[];
  path: string;
  model: BuilderModel<M>;
  builder: { parent: BuilderChain<any>; dispose$: Observable<void> };
  create<M extends O, F extends O>(
    handlers: BuilderHandlers<M, F>,
    model?: BuilderModel<M>,
  ): BuilderChain<F>;
};
