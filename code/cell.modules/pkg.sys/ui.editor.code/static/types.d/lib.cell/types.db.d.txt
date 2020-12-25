import { IModel, IModelLinksSchema, IModelChildrenSchema } from '@platform/fsdb.types';
declare type O = Record<string, unknown>;
export declare type IDbModelChange = {
    uri: string;
    field: string;
    from?: any;
    to?: any;
};
export declare type IDbModelNs<P extends O = any> = IModel<IDbModelNsProps<P>, IDbModelNsDoc<P>, IDbModelNsLinks, IDbModelNsChildren>;
export declare type IDbModelNsProps<P extends O = any> = INs & P;
export declare type IDbModelNsDoc<P extends O = any> = IDbModelNsProps<P>;
export declare type IDbModelNsLinks = IModelLinksSchema;
export declare type IDbModelNsChildren = {
    cells: IDbModelCell[];
    columns: IDbModelColumn[];
    rows: IDbModelRow[];
    files: IDbModelFile[];
};
export declare type IDbModelCell<P extends O = any> = IModel<IDbModelCellProps<P>, IDbModelCellDoc<P>, IDbModelCellLinks, IDbModelCellChilden>;
export declare type IDbModelCellProps<P extends O = any> = ICellData<IDbModelCellDataProps<P>>;
export declare type IDbModelCellDataProps<P extends O = any> = ICellProps & P;
export declare type IDbModelCellDoc<P extends O = any> = IDbModelCellProps<P> & {
    nsRefs?: string[];
};
export declare type IDbModelCellLinks = {
    namespaces: IDbModelNs[];
};
export declare type IDbModelCellChilden = IModelChildrenSchema;
export declare type IDbModelRow<P extends O = any> = IModel<IDbModelRowProps<P>, IDbModelRowDoc<P>, IDbModelRowLinks, IDbModelRowChildren>;
export declare type IDbModelRowProps<P extends O = any> = IRowData<IDbModelRowDataProps<P>>;
export declare type IDbModelRowDataProps<P extends O = any> = IRowProps & P;
export declare type IDbModelRowDoc<P extends O = any> = IDbModelRowProps<P>;
export declare type IDbModelRowLinks = IModelLinksSchema;
export declare type IDbModelRowChildren = IModelChildrenSchema;
export declare type IDbModelColumn<P extends O = any> = IModel<IDbModelColumnProps<P>, IDbModelColumnDoc<P>, IDbModelColumnLinks, IDbModelColumnChildren>;
export declare type IDbModelColumnProps<P extends O = any> = IColumnData<IDbModelColumnDataProps<P>>;
export declare type IDbModelColumnDataProps<P extends O = any> = IColumnProps & P;
export declare type IDbModelColumnDoc<P extends O = any> = IDbModelColumnProps<P>;
export declare type IDbModelColumnLinks = IModelLinksSchema;
export declare type IDbModelColumnChildren = IModelChildrenSchema;
export declare type IDbModelFile = IModel<IDbModelFileProps, IDbModelFileDataProps, IDbModelFileLinks, IDbModelFileChildren>;
export declare type IDbModelFileProps = IFileData;
export declare type IDbModelFileDataProps = IDbModelFileProps;
export declare type IDbModelFileLinks = IModelLinksSchema;
export declare type IDbModelFileChildren = IModelChildrenSchema;
export {};