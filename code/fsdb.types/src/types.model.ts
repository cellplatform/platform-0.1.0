import { Observable } from 'rxjs';
import * as t from './common/types';

/**
 * [Model]
 */
export type ModelValueKind = 'PROP' | 'LINK';

export type IModel<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = IModelProps<P, D, L, C> & IModelMethods<P, D, L, C>;

export type IModelProps<
  P extends object,
  D extends P,
  L extends IModelLinksSchema,
  C extends IModelChildrenSchema = any
> = t.IDbTimestamps & {
  readonly path: string;
  readonly isDisposed: boolean;
  readonly isLoaded: boolean;
  readonly isChanged: boolean;
  readonly exists: boolean | undefined;
  readonly ready: Promise<IModel<P, D, L, C>>;
  readonly changes: IModelChanges<P, D, L, C>;
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<ModelEvent>;
  readonly doc: D; // Raw DB document.
  readonly props: P; // Data as read|write properties.
  readonly links: IModelLinks<L>; // Relationships (JOINs).
  readonly children: IModelChildren<C>; // Relationships (path descendents).
};
export type IModelMethods<
  P extends object,
  D extends P,
  L extends IModelLinksSchema,
  C extends IModelChildrenSchema = any
> = {
  load(options?: { force?: boolean; links?: boolean; silent?: boolean }): Promise<P>;
  reset(): IModel<P, D, L, C>;
  set(props: Partial<P>): IModel<P, D, L, C>;
  beforeSave(): Promise<{}>;
  save(): Promise<{ saved: boolean }>;
  toObject(): P;
};

export type ModelFactory<M extends IModel = IModel> = (args: ModelFactoryArgs) => M;
export type ModelFactoryArgs = { path: string; db: t.IDb };

export type BeforeModelSave<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = (args: IModelSave<P, D, L, C>) => Promise<any>;

/**
 * [Children]
 */
export type IModelChildrenSchema = { [key: string]: IModel[] };
export type IModelChildren<C extends IModelLinksSchema> = { [K in keyof C]: Promise<C[K]> };
export type IModelChildrenDefs<L extends IModelChildrenSchema> = {
  [K in keyof L]: IModelChildrenDef;
};
export type IModelChildrenDef = {
  query: string;
  factory: ModelFactory;
};

/**
 * [Links]
 */
export type IModelLinksSchema = { [key: string]: IModel | IModel[] };

export type IModelLinks<L extends IModelLinksSchema> = { [K in keyof L]: LinkedModelPromise<L, K> };
export type LinkedModelPromise<L extends IModelLinksSchema, K extends keyof L> = L[K] extends IModel
  ? Promise<L[K]> & { link(path: string): void; unlink(): void } // 1:1 relationship.
  : Promise<L[K]> & { link(paths: string[]): void; unlink(paths?: string[]): void }; // 1:* or *:* relationship.

export type ModelLinkRelationship = '1:1' | '1:*';
export type IModelLinkDefs<L extends IModelLinksSchema> = { [K in keyof L]: IModelLinkDef };
export type IModelLinkDef = {
  relationship: ModelLinkRelationship;
  field?: string; // If different from field on the Schema.
  factory: ModelFactory;
};

/**
 * [Changes]
 */
export type IModelChanges<
  P extends object,
  D extends P,
  L extends IModelLinksSchema,
  C extends IModelChildrenSchema
> = {
  length: number;
  list: Array<IModelChange<P, D, L, C>>;
  map: { [K in keyof D]: D[K] };
};
export type IModelChange<
  P extends object,
  D extends P,
  L extends IModelLinksSchema,
  C extends IModelChildrenSchema
> = {
  model: IModel<P, D, L, C>;
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
  | IModelChildrenLoadedEvent
  | IModelReadPropEvent
  | IModelChangingEvent
  | IModelChangedEvent
  | IModelBeforeSaveEvent
  | IModelSavedEvent;

/**
 * Data loading.
 */
export type IModelDataLoaded = { model: IModel; withLinks: boolean; withChildren: boolean };
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

export type IModelChildrenLoaded = { model: IModel; children: IModel[]; field: string };
export type IModelChildrenLoadedEvent = {
  type: 'MODEL/loaded/children';
  typename: string;
  payload: IModelChildrenLoaded;
};

/**
 * Reading.
 */
export type IModelReadPropEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  type: 'MODEL/read/prop';
  typename: string;
  payload: IModelReadProp<P, D, L, C>;
};
export type IModelReadProp<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  model: IModel<P, D, L, C>;
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
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  type: 'MODEL/changing';
  typename: string;
  payload: IModelChanging<P, D, L, C>;
};
export type IModelChanging<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  change: IModelChange<P, D, L, C>;
  isCancelled: boolean;
  cancel(): void;
};

export type IModelChangedEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  type: 'MODEL/changed';
  typename: string;
  payload: IModelChange<P, D, L, C>;
};

/**
 * Save.
 */
export type IModelSave<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  model: IModel<P, D, L>;
  changes: IModelChanges<P, D, L, C>;
};

export type IModelBeforeSaveEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  type: 'MODEL/beforeSave';
  typename: string;
  payload: IModelSave<P, D, L, C>;
};

export type IModelSavedEvent<
  P extends object = {},
  D extends P = P,
  L extends IModelLinksSchema = any,
  C extends IModelChildrenSchema = any
> = {
  type: 'MODEL/saved';
  typename: string;
  payload: IModelSave<P, D, L, C>;
};
