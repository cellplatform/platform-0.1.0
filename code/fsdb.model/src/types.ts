import { Observable } from 'rxjs';
import { IDbTimestamps, IDbValue } from '@platform/fs.db.types/lib/types';
import { INeDb } from '@platform/fs.nedb/lib/types';

/**
 * [Model]
 */
export type IModel<D extends object = {}, L extends ILinkedModelSchema = any> = IModelProps<D, L> &
  IModelMethods<D>;

export type IModelProps<D extends object, L extends ILinkedModelSchema = any> = IDbTimestamps & {
  readonly isDisposed: boolean;
  readonly isReady: boolean;
  readonly exists: boolean | undefined;
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<ModelEvent>;
  readonly data: D;
  readonly links: ILinkedModels<L>;
};
export type IModelMethods<D extends object> = {
  load(options?: { force?: boolean; links?: boolean }): Promise<D>;
  reset(): void;
};

/**
 * [Links]
 */
export type ILinkedModelResolvers<D extends object, L extends ILinkedModelSchema> = {
  [K in keyof L]: LinkedModelResolver<D, L>
};
export type LinkedModelResolver<D extends object, L extends ILinkedModelSchema> = (
  args: ILinkedModelResolverArgs<D, L>,
) => Promise<L[keyof L] | undefined>;

export type ILinkedModelResolverArgs<D extends object, L extends ILinkedModelSchema> = {
  db: INeDb;
  model: IModel<D, L>;
  prop: keyof L;
  data: IDbValue['value'];
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
