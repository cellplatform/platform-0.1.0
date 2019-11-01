import { t } from './common';
import { IModel } from '@platform/fsdb.model/lib/types';

/**
 * Namespace.
 */
export type IModelNs = IModel<IModelNsProps, IModelNsDoc, IModelNsLinks, IModelNsChildren>;
export type IModelNsProps = { name?: string };
export type IModelNsDoc = IModelNsProps & {};
export type IModelNsLinks = {};
export type IModelNsChildren = { cells: IModelCell[]; columns: IModelColumn[]; rows: IModelRow[] };

/**
 * Cell
 */
export type IModelCell = IModel<IModelCellProps, IModelCellDoc, IModelCellLinks, IModelCellChilden>;
export type IModelCellProps = t.ICellData<IModelCellDataProps> & {};
export type IModelCellDataProps = t.ICellProps & { [key: string]: any };
export type IModelCellDoc = IModelCellProps & { nsRefs?: string[] };
export type IModelCellLinks = { namespaces: IModelNs[] };
export type IModelCellChilden = {};

/**
 * Row
 */
export type IModelRow = IModel<IModelRowProps>;
export type IModelRowProps = { key: string }; // TEMP 🐷

/**
 * Column
 */
export type IModelColumn = IModel<IModelColumnProps>;
export type IModelColumnProps = { key: string }; // TEMP 🐷
