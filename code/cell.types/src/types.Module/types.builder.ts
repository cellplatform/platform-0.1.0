type O = Record<string, unknown>;

export type BuilderNamedItem = { name: string };
export type BuilderIndexParam = BuilderIndexEdge | number | BuilderIndexCalc;
export type BuilderIndexEdge = 'END' | 'START';
export type BuilderIndexCalc = (args: BuilderIndexCalcArgs) => number;
export type BuilderIndexCalcArgs = { total: number; list: any[] };

/**
 * Builder
 */
export type Builder = { chain: BuilderChainFactory };
export type BuilderChain<A extends O> = A;

/**
 * Model/State
 * NB:
 *    This is a slimmed down version of an [IStateObjectWritable] type.
 */
export type BuilderModel<M extends O> = {
  change: BuilderModelChange<M>;
  state: M;
};
export type BuilderModelChange<M extends O> = (fn: (draft: M) => void) => void;

/**
 * API Handlers
 */
export type BuilderHandlers<M extends O, A extends O> = {
  [K in keyof A]: BuilderHandler<M> | BuilderChild;
};

export type BuilderHandler<M extends O> = (args: BuilderHandlerArgs<M>) => any;
export type BuilderHandlerArgs<M extends O> = {
  kind: BuilderMethodKind;
  key: string;
  path: string;
  index: number; // NB: -1 if not relevant (ie. not related to an array-list).
  params: any[];
  parent?: BuilderChain<any>;
  is: { list: boolean; map: boolean };
  model: BuilderModel<M>;
};
export type BuilderMethodKind = 'ROOT' | BuilderChild['kind'];
export type BuilderMethodKindList = BuilderListByIndexDef['kind'] | BuilderListByNameDef['kind'];
export type BuilderMethodKindObject = BuilderObjectDef['kind'] | BuilderMapDef['kind'];

export type BuilderGetHandlers<M extends O, A extends O> = (
  args: BuilderGetHandlersArgs,
) => BuilderHandlers<M, A>;
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
  path: string;
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
export type BuilderMap<T, K = string, A extends O = O> = (key: K, args?: A) => T;

/**
 * FACTORY: Chain builder
 */
export type BuilderChainFactory = <M extends O, A extends O>(
  args: BuilderChainFactoryArgs<M, A>,
) => BuilderChain<A>;
export type BuilderChainFactoryArgs<M extends O, A extends O> = {
  model: BuilderModel<M>;
  handlers: BuilderHandlers<M, A>;
};

/**
 * FACTORY: Child builders
 */
export type BuilderMapFactory<M extends O, A extends O> = (
  args: BuilderMapFactoryArgs<M>,
) => BuilderChain<A>;
export type BuilderMapFactoryArgs<M extends O> = BuilderChildFactoryArgs<M> & { key: string };

export type BuilderListFactory<M extends O, A extends O> = (
  args: BuilderListFactoryArgs<M>,
) => BuilderChain<A>;
export type BuilderListFactoryArgs<M extends O> = BuilderChildFactoryArgs<M> & { index: number };

export type BuilderChildFactoryArgs<M extends O> = {
  path: string;
  model: BuilderModel<M>;
  create<M extends O, A extends O>(
    handlers: BuilderHandlers<M, A>,
    model?: BuilderModel<M>,
  ): BuilderChain<A>;
};
