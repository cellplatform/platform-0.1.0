import { Observable } from 'rxjs';
import { IJsonMap } from '@platform/types';
import { IDbTimestamps } from '@platform/fs.db.types/lib/types';
import { INeDb } from '@platform/fs.nedb/lib/types';

/**
 * [Model]
 */
export type IModel<P extends object = {}, L extends ILinkedModelSchema = any> = IModelProps<P, L> &
  IModelMethods<P>;

export type IModelProps<P extends object, L extends ILinkedModelSchema = any> = IDbTimestamps & {
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly exists: boolean | undefined;
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<ModelEvent>;
  readonly doc: IJsonMap; // Raw DB data.
  readonly props: P; // Property API.
  readonly links: ILinkedModels<L>; // Relationships (JOINs).
};
export type IModelMethods<D extends object> = {
  load(options?: { force?: boolean; links?: boolean }): Promise<D>;
  reset(): void;
};

/**
 * [Links]
 */
export type ILinkedModelResolvers<P extends object, L extends ILinkedModelSchema> = {
  [K in keyof L]: LinkedModelResolver<P, L>
};
export type LinkedModelResolver<P extends object, L extends ILinkedModelSchema> = (
  args: ILinkedModelResolverArgs<P, L>,
) => Promise<L[keyof L] | undefined>;

export type ILinkedModelResolverArgs<P extends object, L extends ILinkedModelSchema> = {
  db: INeDb;
  model: IModel<P, L>;
  prop: keyof L;
};

export type ILinkedModelSchema = { [key: string]: IModel | IModel[] };
export type ILinkedModels<L extends ILinkedModelSchema> = { [P in keyof L]: Promise<L[P]> };

/**
 * [Events]
 */
export type ModelEvent = IModelDataLoadedEvent | IModelLinkLoadedEvent;

export type IModelDataLoadedEvent = {
  type: 'MODEL/loaded/data';
  payload: IModelDataLoaded;
};
export type IModelDataLoaded = { model: IModel; withLinks: boolean };

export type IModelLinkLoadedEvent = {
  type: 'MODEL/loaded/link';
  payload: IModelLinkLoaded;
};
export type IModelLinkLoaded = { model: IModel; prop: string };
