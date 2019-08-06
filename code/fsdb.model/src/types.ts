import { Observable } from 'rxjs';
import { IDb, IDbTimestamps } from '@platform/fsdb.types/lib/types';

/**
 * [Model]
 */

export type IModel<
  P extends object = {},
  D extends P = P,
  L extends ILinkedModelSchema = any
> = IModelProps<P, D, L> & IModelMethods<P>;

export type IModelProps<
  P extends object,
  D extends P,
  L extends ILinkedModelSchema
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
  readonly links: ILinkedModels<L>; // Relationships (JOIN's).
};
export type IModelMethods<P extends object> = {
  load(options?: { force?: boolean; links?: boolean; silent?: boolean }): Promise<P>;
  reset(): void;
  save(): Promise<{ saved: boolean }>;
  toObject(): P;
};

/**
 * [Links]
 */
export type LinkedModelRelationship = '1:1' | '1:*';

export type ILinkedModelDefs<L extends ILinkedModelSchema> = { [K in keyof L]: ILinkedModelDef };

export type ILinkedModelDef = {
  relationship: LinkedModelRelationship;
  create: (args: { path: string; db: IDb }) => IModel;
  field?: string; // If different from field on the [ILinkedModelSchema]
};

export type ILinkedModelSchema = { [key: string]: IModel | IModel[] };
export type ILinkedModels<L extends ILinkedModelSchema> = {
  [K in keyof L]: LinkedModelPromise<L, K>
};

export type LinkedModelPromise<
  L extends ILinkedModelSchema,
  K extends keyof L
> = L[K] extends IModel
  ? Promise<L[K]> & { link(path: string): void; unlink(): void } // 1:1 relationship.
  : Promise<L[K]> & { link(paths: string[]): void; unlink(paths?: string[]): void }; // 1:* or *:* relationship.

/**
 * [Changes]
 */

export type IModelChanges<P extends object, D extends P, L extends ILinkedModelSchema> = {
  length: number;
  list: Array<IModelChange<P, D, L>>;
  map: { [K in keyof D]: D[K] };
};
export type IModelChange<P extends object, D extends P, L extends ILinkedModelSchema> = {
  model: IModel<P, D, L>;
  field: string;
  value: { from?: any; to?: any };
  doc: { from: D; to: D };
  modifiedAt: number;
  kind: ModelChangeKind;
};
export type ModelChangeKind = 'PROP' | 'LINK';

/**
 * [Events]
 */
export type ModelEvent =
  | IModelDataLoadedEvent
  | IModelLinkLoadedEvent
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
 * Changes.
 */
export type IModelChangingEvent<
  P extends object = {},
  D extends P = P,
  L extends ILinkedModelSchema = any
> = {
  type: 'MODEL/changing';
  typename: string;
  payload: IModelChanging<P, D, L>;
};
export type IModelChanging<
  P extends object = {},
  D extends P = P,
  L extends ILinkedModelSchema = any
> = {
  change: IModelChange<P, D, L>;
  isCancelled: boolean;
  cancel(): void;
};

export type IModelChangedEvent<
  P extends object = {},
  D extends P = P,
  L extends ILinkedModelSchema = any
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
  L extends ILinkedModelSchema = any
> = {
  type: 'MODEL/saved';
  typename: string;
  payload: IModelSaved<P, D, L>;
};
export type IModelSaved<
  P extends object = {},
  D extends P = P,
  L extends ILinkedModelSchema = any
> = {
  model: IModel<P, D, L>;
  changes: IModelChanges<P, D, L>;
};
