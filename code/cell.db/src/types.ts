import { t } from './common';
import { IModel } from '@platform/fsdb.model/lib/types';

/**
 * Namespace.
 */
export type IDbModelNs = IModel<
  IDbModelNsProps,
  IDbModelNsDoc,
  IDbModelNsLinks,
  IDbModelNsChildren
>;
export type IDbModelNsProps = t.INs & {};
export type IDbModelNsDoc = IDbModelNsProps & {};
export type IDbModelNsLinks = {};
export type IDbModelNsChildren = {
  cells: IDbModelCell[];
  columns: IDbModelColumn[];
  rows: IDbModelRow[];
};

/**
 * Cell
 */
export type IDbModelCell = IModel<
  IDbModelCellProps,
  IDbModelCellDoc,
  IDbModelCellLinks,
  IDbModelCellChilden
>;
export type IDbModelCellProps = t.ICellData<IDbModelCellDataProps> & {};
export type IDbModelCellDataProps = t.ICellProps & { [key: string]: any };
export type IDbModelCellDoc = IDbModelCellProps & { nsRefs?: string[] };
export type IDbModelCellLinks = { namespaces: IDbModelNs[] };
export type IDbModelCellChilden = {};

/**
 * Row
 */
export type IDbModelRow = IModel<IDbModelRowProps>;
export type IDbModelRowProps = { key: string }; // TEMP 🐷

/**
 * Column
 */
export type IDbModelColumn = IModel<IDbModelColumnProps>;
export type IDbModelColumnProps = { key: string }; // TEMP 🐷
