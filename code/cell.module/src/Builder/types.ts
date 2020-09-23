import { IStateObjectWritable } from '@platform/state.types';

type O = Record<string, unknown>;
type BuilderMethodsAny = BuilderMethods<any, any>;
type BuilderAny = Builder<any, any>;

export type BuilderNamedItem = { name: string };

export type BuilderIndexParam = number | BuilderIndexEdge | BuilderIndexCalc;
export type BuilderIndexEdge = 'START' | 'END';
export type BuilderIndexCalc = (args: BuilderIndexCalcArgs) => number;
export type BuilderIndexCalcArgs = { total: number; list: any[] };

/**
 * Methods
 */
export type BuilderMethods<S extends O, M extends O> = {
  [K in keyof M]: BuilderMethod<S> | BuilderChild;
};

export type BuilderMethod<S extends O> = (args: BuilderMethodArgs<S>) => any;
export type BuilderMethodArgs<S extends O> = {
  kind: BuilderMethodKind;
  model: IStateObjectWritable<S>;
  path: string;
  key: string;
  index: number; // NB: -1 if not relevant (ie. not related to an array-list).
  params: any[];
  parent?: BuilderAny;
  isList: boolean;
  isMap: boolean;
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
  path: string; // JsonPath to location in model.
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
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
  path: string; // JsonPath to location in model.
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
};
export type BuilderListByName<T, N = string> = (name: N, index?: BuilderIndexParam) => T;

/**
 * Child: MAP
 *        A child that is keyed within an object-map on the parent.
 */
export type BuilderMapDef = {
  kind: 'map';
  path: string; // JsonPath to location in model.
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
};
export type BuilderMap<T, K = string> = (key: K, defaultObject?: O) => T;

/**
 * Builder
 */
export type Builder<S extends O, M extends O> = M;
