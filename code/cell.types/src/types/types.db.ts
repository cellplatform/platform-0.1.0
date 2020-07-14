import { t } from '../common';
import { IModel, IModelLinksSchema, IModelChildrenSchema } from '@platform/fsdb.types';

export type IDbModelChange = {
  uri: string;
  field: string;
  from?: any;
  to?: any;
};

/**
 * Namespace
 */
export type IDbModelNs<P extends Record<string, unknown> = any> = IModel<
  IDbModelNsProps<P>,
  IDbModelNsDoc<P>,
  IDbModelNsLinks,
  IDbModelNsChildren
>;
export type IDbModelNsProps<P extends Record<string, unknown> = any> = t.INs & P;
export type IDbModelNsDoc<P extends Record<string, unknown> = any> = IDbModelNsProps<P>;
export type IDbModelNsLinks = IModelLinksSchema;
export type IDbModelNsChildren = {
  cells: IDbModelCell[];
  columns: IDbModelColumn[];
  rows: IDbModelRow[];
  files: IDbModelFile[];
};

/**
 * Cell
 */
export type IDbModelCell<P extends Record<string, unknown> = any> = IModel<
  IDbModelCellProps<P>,
  IDbModelCellDoc<P>,
  IDbModelCellLinks,
  IDbModelCellChilden
>;
export type IDbModelCellProps<P extends Record<string, unknown> = any> = t.ICellData<
  IDbModelCellDataProps<P>
>;
export type IDbModelCellDataProps<P extends Record<string, unknown> = any> = t.ICellProps & P;
export type IDbModelCellDoc<P extends Record<string, unknown> = any> = IDbModelCellProps<P> & {
  nsRefs?: string[];
};
export type IDbModelCellLinks = { namespaces: IDbModelNs[] };
export type IDbModelCellChilden = IModelChildrenSchema;

/**
 * Row
 */
export type IDbModelRow<P extends Record<string, unknown> = any> = IModel<
  IDbModelRowProps<P>,
  IDbModelRowDoc<P>,
  IDbModelRowLinks,
  IDbModelRowChildren
>;
export type IDbModelRowProps<P extends Record<string, unknown> = any> = t.IRowData<
  IDbModelRowDataProps<P>
>;
export type IDbModelRowDataProps<P extends Record<string, unknown> = any> = t.IRowProps & P;
export type IDbModelRowDoc<P extends Record<string, unknown> = any> = IDbModelRowProps<P>;
export type IDbModelRowLinks = IModelLinksSchema;
export type IDbModelRowChildren = IModelChildrenSchema;

/**
 * Column
 */
export type IDbModelColumn<P extends Record<string, unknown> = any> = IModel<
  IDbModelColumnProps<P>,
  IDbModelColumnDoc<P>,
  IDbModelColumnLinks,
  IDbModelColumnChildren
>;
export type IDbModelColumnProps<P extends Record<string, unknown> = any> = t.IColumnData<
  IDbModelColumnDataProps<P>
>;
export type IDbModelColumnDataProps<P extends Record<string, unknown> = any> = t.IColumnProps & P;
export type IDbModelColumnDoc<P extends Record<string, unknown> = any> = IDbModelColumnProps<P>;
export type IDbModelColumnLinks = IModelLinksSchema;
export type IDbModelColumnChildren = IModelChildrenSchema;

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
