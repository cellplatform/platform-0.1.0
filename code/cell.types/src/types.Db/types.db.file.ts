import { t } from '../common';
import { IModel, IModelLinksSchema, IModelChildrenSchema } from '@platform/fsdb.types';

/**
 * File
 */
export type IDbModelFile = IModel<
  IDbModelFileProps,
  IDbModelFileDataProps,
  IDbModelFileLinks,
  IDbModelFileChildren
>;
export type IDbModelFileProps = t.IFileData;
export type IDbModelFileDataProps = IDbModelFileProps;
export type IDbModelFileLinks = IModelLinksSchema;
export type IDbModelFileChildren = IModelChildrenSchema;
