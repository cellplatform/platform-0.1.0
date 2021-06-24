import { t } from '../common';
import { IModel, IModelLinksSchema, IModelChildrenSchema } from '@platform/fsdb.types';

type O = Record<string, unknown>;

/**
 * Cell
 */
export type IDbModelCell<P extends O = any> = IModel<
  IDbModelCellProps<P>,
  IDbModelCellDoc<P>,
  IDbModelCellLinks,
  IDbModelCellChilden
>;
export type IDbModelCellProps<P extends O = any> = t.ICellData<IDbModelCellDataProps<P>>;
export type IDbModelCellDataProps<P extends O = any> = t.ICellProps & P;
export type IDbModelCellDoc<P extends O = any> = IDbModelCellProps<P> & {
  nsRefs?: string[];
};
export type IDbModelCellLinks = { namespaces: t.IDbModelNs[] };
export type IDbModelCellChilden = IModelChildrenSchema;

/**
 * Row
 */
export type IDbModelRow<P extends O = any> = IModel<
  IDbModelRowProps<P>,
  IDbModelRowDoc<P>,
  IDbModelRowLinks,
  IDbModelRowChildren
>;
export type IDbModelRowProps<P extends O = any> = t.IRowData<IDbModelRowDataProps<P>>;
export type IDbModelRowDataProps<P extends O = any> = t.IRowProps & P;
export type IDbModelRowDoc<P extends O = any> = IDbModelRowProps<P>;
export type IDbModelRowLinks = IModelLinksSchema;
export type IDbModelRowChildren = IModelChildrenSchema;

/**
 * Column
 */
export type IDbModelColumn<P extends O = any> = IModel<
  IDbModelColumnProps<P>,
  IDbModelColumnDoc<P>,
  IDbModelColumnLinks,
  IDbModelColumnChildren
>;
export type IDbModelColumnProps<P extends O = any> = t.IColumnData<IDbModelColumnDataProps<P>>;
export type IDbModelColumnDataProps<P extends O = any> = t.IColumnProps & P;
export type IDbModelColumnDoc<P extends O = any> = IDbModelColumnProps<P>;
export type IDbModelColumnLinks = IModelLinksSchema;
export type IDbModelColumnChildren = IModelChildrenSchema;
