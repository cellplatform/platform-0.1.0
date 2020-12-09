export declare type ILinkKey = {
    prefix: string;
    key: string;
    path: string;
    dir: string;
    name: string;
    ext: string;
};
export declare type ILinkValue<U extends IUri, Q extends ILinkQuery> = {
    uri: U;
    value: string;
    query: Q;
};
export declare type ILink<U extends IUri, Q extends ILinkQuery> = ILinkKey & ILinkValue<U, Q>;
export declare type ILinkQuery = Record<string, string | boolean>;
export declare type IFileLink = ILink<IFileUri, IFileLinkQuery> & {
    toString: FileLinkToString;
};
export declare type IFileLinkQuery = ILinkQuery & {
    hash?: string;
    status?: FileLinkQueryStatus;
};
export declare type FileLinkQueryStatus = 'uploading';
export declare type FileLinkToString = (options?: {
    hash?: string | null;
    status?: string | null;
}) => string;
export declare type IRefLink<U extends IRefLinkUri = IRefLinkUri> = ILink<U, IRefLinkQuery> & {
    toString: RefLinkToString;
};
export declare type IRefLinkUri = INsUri | ICellUri | IColumnUri | IRowUri;
export declare type IRefLinkQuery = ILinkQuery & {
    hash?: string;
};
export declare type RefLinkToString = (options?: {
    hash?: string | null;
}) => string;