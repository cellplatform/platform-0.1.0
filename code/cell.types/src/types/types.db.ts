import { t } from '../common';
import { IModel } from '@platform/fsdb.types';

/**
 * Namespace.
 */
export type IDbModelNs<P extends object = {}> = IModel<
  IDbModelNsProps<P>,
  IDbModelNsDoc<P>,
  IDbModelNsLinks,
  IDbModelNsChildren
>;
export type IDbModelNsProps<P extends object = {}> = t.INs & P;
export type IDbModelNsDoc<P extends object = {}> = IDbModelNsProps<P> & {};
export type IDbModelNsLinks = {};
export type IDbModelNsChildren = {
  cells: IDbModelCell[];
  columns: IDbModelColumn[];
  rows: IDbModelRow[];
};

/**
 * Cell
 */
export type IDbModelCell<P extends object = {}> = IModel<
  IDbModelCellProps<P>,
  IDbModelCellDoc<P>,
  IDbModelCellLinks,
  IDbModelCellChilden
>;
export type IDbModelCellProps<P extends object = {}> = t.ICellData<IDbModelCellDataProps<P>>;
export type IDbModelCellDataProps<P extends object = {}> = t.ICellProps & P;
export type IDbModelCellDoc<P extends object = {}> = IDbModelCellProps<P> & { nsRefs?: string[] };
export type IDbModelCellLinks = { namespaces: IDbModelNs[] };
export type IDbModelCellChilden = {};

/**
 * Row
 */
export type IDbModelRow<P extends object = {}> = IModel<IDbModelRowProps<P>>;
export type IDbModelRowProps<P extends object = {}> = t.IRowData<IDbModelRowDataProps<P>>;
export type IDbModelRowDataProps<P extends object = {}> = t.IRowProps & P;

/**
 * Column
 */
export type IDbModelColumn<P extends object = {}> = IModel<IDbModelColumnProps<P>>;
export type IDbModelColumnProps<P extends object = {}> = t.IColumnData<IDbModelColumnDataProps<P>>;
export type IDbModelColumnDataProps<P extends object = {}> = t.IColumnProps & P;
