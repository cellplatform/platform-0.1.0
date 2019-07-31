import { Observable } from 'rxjs';
import { IDb, IDbTimestamps } from '@platform/fs.db.types/lib/types';

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
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly isChanged: boolean;
  readonly exists: boolean | undefined;
  readonly changes: IModelChanges<P, D, L>;
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<ModelEvent>;
  readonly doc: D; // Raw DB document.
  readonly props: P; // Data as read/write properties.
  readonly links: ILinkedModels<L>; // Relationships (JOIN's).
};
export type IModelMethods<P extends object> = {
  load(options?: { force?: boolean; links?: boolean }): Promise<P>;
  reset(): void;
  toObject(): P;
};

/**
 * [Links]
 */
export type ILinkedModelResolvers<P extends object, D extends P, L extends ILinkedModelSchema> = {
  [K in keyof L]: {
    relationship: '1:1' | '*:1' | '1:*' | '*:*';
    resolve: LinkedModelResolver<P, D, L>;
  }
};
export type LinkedModelResolver<P extends object, D extends P, L extends ILinkedModelSchema> = (
  args: ILinkedModelResolverArgs<P, D, L>,
) => Promise<L[keyof L] | undefined>;
export type ILinkedModelResolverArgs<
  P extends object,
  D extends P,
  L extends ILinkedModelSchema
> = {
  db: IDb;
  model: IModel<P, D, L>;
  field: keyof L;
};

export type ILinkedModelSchema = { [key: string]: IModel | IModel[] };
export type ILinkedModels<L extends ILinkedModelSchema> = { [P in keyof L]: Promise<L[P]> };

/**
 * [Changes]
 */

export type IModelChanges<P extends object, D extends P, L extends ILinkedModelSchema> = {
  total: number;
  list: Array<IModelChange<P, D, L>>;
  map: { [K in keyof D]: D[K] };
};
export type IModelChange<P extends object, D extends P, L extends ILinkedModelSchema> = {
  model: IModel<P, D, L>;
  field: string;
  value: { from?: any; to?: any };
  doc: { from: D; to: D };
  modifiedAt: number;
};

/**
 * [Events]
 */
export type ModelEvent = IModelDataLoadedEvent | IModelLinkLoadedEvent | IModelChangedEvent;

export type IModelDataLoaded = { model: IModel; withLinks: boolean };
export type IModelDataLoadedEvent = {
  type: 'MODEL/loaded/data';
  payload: IModelDataLoaded;
};

export type IModelLinkLoaded = { model: IModel; field: string };
export type IModelLinkLoadedEvent = {
  type: 'MODEL/loaded/link';
  payload: IModelLinkLoaded;
};

export type IModelChangedEvent<
  P extends object = {},
  D extends P = P,
  L extends ILinkedModelSchema = any
> = {
  type: 'MODEL/changed';
  payload: IModelChange<P, D, L>;
};
