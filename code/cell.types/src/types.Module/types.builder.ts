type O = Record<string, unknown>;
type BuilderMethodsAny = BuilderHandlers<any, any>;

export type BuilderNamedItem = { name: string };
export type BuilderIndexParam = number | BuilderIndexEdge | BuilderIndexCalc;
export type BuilderIndexEdge = 'START' | 'END';
export type BuilderIndexCalc = (args: BuilderIndexCalcArgs) => number;
export type BuilderIndexCalcArgs = { total: number; list: any[] };

/**
 * Builder
 */
export type Builder = { chain: BuilderChainFactory };

export type BuilderChain<A extends O> = A;
export type BuilderChainFactory = <M extends O, A extends O, C extends O = O>(args: {
  handlers: BuilderHandlers<M, A, C>;
  change: BuilderModelChange<M>;
  state: () => M;
  context?: () => C;
}) => BuilderChain<A>;

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
export type BuilderHandlers<M extends O, A extends O, C extends O = O> = {
  [K in keyof A]: BuilderHandler<M, C> | BuilderChild;
};

export type BuilderHandler<M extends O, C extends O = O> = (args: BuilderHandlerArgs<M, C>) => any;
export type BuilderHandlerArgs<M extends O, C extends O = O> = {
  kind: BuilderMethodKind;
  key: string;
  path: string;
  index: number; // NB: -1 if not relevant (ie. not related to an array-list).
  params: any[];
  parent?: BuilderChain<any>;
  is: { list: boolean; map: boolean };
  model: BuilderModel<M>;
  context: C;
};
export type BuilderMethodKind = 'ROOT' | BuilderChild['kind'];

/**
 * Children
 */
export type BuilderChild =
  | BuilderObjectDef
  | BuilderListByIndexDef
  | BuilderListByNameDef
  | BuilderMapDef;

/**
 * Child: OBJECT
 *        A simple child object which is not part of a [list] or {map}.
 */
export type BuilderObjectDef = {
  kind: 'object';
  path: string;
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
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
  path?: string; // JsonPath to location in model.
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
  default?: (args: { path: string }) => O;
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
  path?: string; // JsonPath to location in model.
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
  default?: (args: { path: string }) => O;
};
export type BuilderListByName<T, N = string> = (name: N, index?: BuilderIndexParam) => T;

/**
 * Child: MAP
 *        A child that is keyed within an object-map on the parent.
 */
export type BuilderMapDef = {
  kind: 'map';
  path?: string; // JsonPath to location in model.
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
  default?: (args: { path: string }) => O;
};
export type BuilderMap<T, K = string, A extends O = O> = (key: K, args?: A) => T;
