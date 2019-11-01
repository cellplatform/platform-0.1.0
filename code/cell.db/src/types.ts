import { t } from './common';
import { IModel } from '@platform/fsdb.model/lib/types';

/**
 * Namespace.
 */
export type IModelNs = IModel<IModelNsProps, IModelNsDoc, IModelNsLinks, IModelNsChildren>;
export type IModelNsProps = { name?: string };
export type IModelNsDoc = IModelNsProps & {};
export type IModelNsLinks = {};
export type IModelNsChildren = {
  cells: IModelCell[];
  rows: IModelRow[];
  columns: IModelColumn[];
};

/**
 * Cell
 */
export type IModelCell = IModel<IModelCellProps>;

export type IModelCellProps = t.ICellData<IModelCellDataProps> & {};
export type IModelCellDataProps = t.ICellProps & { [key: string]: any };



/**
 * Row
 */
export type IModelRow = IModel<IModelRowProps>;
export type IModelRowProps = { key: string };

/**
 * Column
 */
export type IModelColumn = IModel<IModelColumnProps>;
export type IModelColumnProps = { key: string };
