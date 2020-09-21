import { IStateObjectWritable } from '@platform/state.types';

type O = Record<string, unknown>;
type BuilderMethodsAny = BuilderMethods<any, any>;
type BuilderAny = Builder<any, any>;

/**
 * Methods
 */
export type BuilderMethods<S extends O, M extends O> = {
  [K in keyof M]: BuilderMethod<S> | BuilderChild;
};

export type BuilderMethod<S extends O> = (args: BuilderMethodArgs<S>) => any;
export type BuilderMethodArgs<S extends O> = {
  model: IStateObjectWritable<S>;
  path: string;
  key: string;
  index: number;
  params: any[];
  parent?: BuilderAny;
};

/**
 * Children
 */
export type BuilderChild = BuilderChildObject | BuilderChildListIndexed | BuilderChildMap;

export type BuilderChildArgs = {
  path: string;
  model: IStateObjectWritable<any>;
  parent: BuilderAny;
};

/**
 * Child: OBJECT
 *        A simple child object which is not part of a [list] or {map}.
 */
export type BuilderChildObject = {
  kind: 'CHILD/object';
  path: string;
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
};
export type BuilderChildObjectArgs = BuilderChildArgs;

/**
 * Child: LIST
 *        A child that is indexed within a list (array) on the parent.
 */
export type BuilderChildListIndexed = {
  kind: 'CHILD/list:byIndex';
  path: string;
  handlers: BuilderMethodsAny | (() => BuilderMethodsAny);
};
export type BuilderChildListIndexedArgs = BuilderChildArgs & {
  index: number;
};

/**
 * Child: MAP
 *        A child that is keyed within an object-map on the parent.
 */
export type BuilderChildMap = {
  kind: 'CHILD/map';
  builder(args: BuilderChildMapArgs): BuilderAny;
};
export type BuilderChildMapArgs = BuilderChildArgs & {
  key: string;
  // model: IStateObjectWritable<any>;
};

/**
 * Builder
 */
export type Builder<S extends O, M extends O> = M;
