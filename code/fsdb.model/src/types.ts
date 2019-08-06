import { Observable } from 'rxjs';
import { IDb, IDbTimestamps } from '@platform/fsdb.types/lib/types';

/**
 * [Model]
 */
export type ModelValueKind = 'PROP' | 'LINK';

export type IModel<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = IModelProps<P, D, L> & IModelMethods<P>;

export type IModelProps<
  P extends object,
  D extends P,
  L extends IModelLinksSchema
> = IDbTimestamps & {
  readonly path: string;
  readonly isDisposed: boolean;
  readonly isLoaded: boolean;
  readonly isChanged: boolean;
  readonly exists: boolean | undefined;
  readonly ready: Promise<IModel<P, D, L>>;
  readonly changes: IModelChanges<P, D, L>;
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<ModelEvent>;
  readonly doc: D; // Raw DB document.
  readonly props: P; // Data as read|write properties.
  readonly links: IModelLinks<L>; // Relationships (JOIN's).
};
export type IModelMethods<P extends object> = {
  load(options?: { force?: boolean; links?: boolean; silent?: boolean }): Promise<P>;
  reset(): void;
  save(): Promise<{ saved: boolean }>;
  toObject(): P;
};

/**
 * [Children]
 */
// export type IModelChildren<C extends IModelLinksSchema> = {
//   [K in keyof C]: LinkedModelPromise<C, K>
// };
// export type ChildModelsPromise<C extends IModelLinksSchema, K extends keyof C> = C[K] extends IModel
//   ? Promise<C[K]> & { link(path: string): void; unlink(): void } // 1:1 relationship.
//   : Promise<C[K]> & { link(paths: string[]): void; unlink(paths?: string[]): void }; // 1:* or *:* relationship.

/**
 * [Links]
 */
export type ModelLinkRelationship = '1:1' | '1:*';
export type IModelLinksSchema = { [key: string]: IModel | IModel[] };

export type IModelLinks<L extends IModelLinksSchema> = { [K in keyof L]: LinkedModelPromise<L, K> };
export type LinkedModelPromise<L extends IModelLinksSchema, K extends keyof L> = L[K] extends IModel
  ? Promise<L[K]> & { link(path: string): void; unlink(): void } // 1:1 relationship.
  : Promise<L[K]> & { link(paths: string[]): void; unlink(paths?: string[]): void }; // 1:* or *:* relationship.

export type IModelLinkDefs<L extends IModelLinksSchema> = { [K in keyof L]: IModelLinkDef };
export type IModelLinkDef = {
  relationship: ModelLinkRelationship;
  field?: string; // If different from field on the [ILinkedModelSchema]
  factory: (args: { path: string; db: IDb }) => IModel;
};

/**
 * [Changes]
 */

export type IModelChanges<P extends object, D extends P, L extends IModelLinksSchema> = {
  length: number;
  list: Array<IModelChange<P, D, L>>;
  map: { [K in keyof D]: D[K] };
};
export type IModelChange<P extends object, D extends P, L extends IModelLinksSchema> = {
  model: IModel<P, D, L>;
  kind: ModelValueKind;
  field: string;
  value: { from?: any; to?: any };
  doc: { from: D; to: D };
  modifiedAt: number;
};

/**
 * [Events]
 */
export type ModelEvent =
  | IModelDataLoadedEvent
  | IModelLinkLoadedEvent
  | IModelReadPropEvent
  | IModelChangingEvent
  | IModelChangedEvent
  | IModelSavedEvent;

/**
 * Data loading.
 */
export type IModelDataLoaded = { model: IModel; withLinks: boolean };
export type IModelDataLoadedEvent = {
  type: 'MODEL/loaded/data';
  typename: string;
  payload: IModelDataLoaded;
};

export type IModelLinkLoaded = { model: IModel; field: string };
export type IModelLinkLoadedEvent = {
  type: 'MODEL/loaded/link';
  typename: string;
  payload: IModelLinkLoaded;
};

/**
 * Reading.
 */
export type IModelReadPropEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  type: 'MODEL/read/prop';
  typename: string;
  payload: IModelReadProp<P, D, L>;
};
export type IModelReadProp<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  model: IModel<P, D, L>;
  field: string;
  value?: any;
  doc: D;
  isModified: boolean;
  modify(value: any): void;
};

/**
 * Changes.
 */
export type IModelChangingEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  type: 'MODEL/changing';
  typename: string;
  payload: IModelChanging<P, D, L>;
};
export type IModelChanging<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  change: IModelChange<P, D, L>;
  isCancelled: boolean;
  cancel(): void;
};

export type IModelChangedEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  type: 'MODEL/changed';
  typename: string;
  payload: IModelChange<P, D, L>;
};

/**
 * Save.
 */
export type IModelSavedEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  type: 'MODEL/saved';
  typename: string;
  payload: IModelSaved<P, D, L>;
};
export type IModelSaved<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any
> = {
  model: IModel<P, D, L>;
  changes: IModelChanges<P, D, L>;
};
