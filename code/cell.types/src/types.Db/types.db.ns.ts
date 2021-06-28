import { t } from '../common';
import { IModel, IModelLinksSchema } from '@platform/fsdb.types';

type O = Record<string, unknown>;

/**
 * Namespace
 */
export type IDbModelNs<P extends O = any> = IModel<
  t.IDbModelNsProps<P>,
  t.IDbModelNsDoc<P>,
  t.IDbModelNsLinks,
  t.IDbModelNsChildren
>;
export type IDbModelNsProps<P extends O = any> = t.INs & P;
export type IDbModelNsDoc<P extends O = any> = IDbModelNsProps<P>;
export type IDbModelNsLinks = IModelLinksSchema;
export type IDbModelNsChildren = {
  cells: t.IDbModelCell[];
  columns: t.IDbModelColumn[];
  rows: t.IDbModelRow[];
  files: t.IDbModelFile[];
};
