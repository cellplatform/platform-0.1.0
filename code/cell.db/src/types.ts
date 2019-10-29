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
export type IModelCellProps = { key: string };

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

/**
 * URI
 */
export type UriType = IUri['type'];
export type IUri = INsUri | IUriCoord | IUnknownUri;
export type IUriCoord = ICellUri | IRowUri | IColumnUri;

export type INsUri = { type: 'ns'; id: string };
export type ICellUri = { type: 'cell'; id: string; ns: string };
export type IRowUri = { type: 'row'; id: string; ns: string };
export type IColumnUri = { type: 'col'; id: string; ns: string };
export type IUnknownUri = { type: 'UNKNOWN' };
