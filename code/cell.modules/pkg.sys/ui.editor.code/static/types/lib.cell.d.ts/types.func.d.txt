export declare type FuncParam = Json | undefined;
export declare type FuncResponse = any;
export declare type FuncInvoker = (args: {
    params: FuncParam[];
}) => Promise<FuncResponse>;
export declare type GetFunc = (args: IGetFuncArgs) => Promise<FuncInvoker | undefined>;
export declare type IGetFuncArgs = {
    namespace: string;
    name: string;
};
export declare type FuncPromise<T> = Promise<T> & {
    eid: string;
};
export declare type IFuncResponse<T = any> = {
    ok: boolean;
    eid: string;
    elapsed: number;
    type: RefTarget;
    cell: string;
    formula: string;
    data?: T;
    error?: IFuncError;
};
export declare type IFuncResponseMap = {
    [key: string]: IFuncResponse;
};
export declare type IFuncManyResponse = {
    ok: boolean;
    eid: string;
    elapsed: number;
    list: IFuncResponse[];
    map: IFuncResponseMap;
};
export declare type IFuncTable = {
    cache: IMemoryCache;
    getCells: GetCells;
    refsTable: IRefsTable;
    getFunc: GetFunc;
    calculate(args?: {
        cells?: string | string[];
        event$?: Subject<FuncEvent>;
    }): FuncPromise<IFuncTableResponse>;
};
export declare type IFuncTableResponse = {
    ok: boolean;
    eid: string;
    elapsed: number;
    list: IFuncResponse[];
    map: ICellMap;
};
export declare type FuncEvent = FuncOneEvent | FuncManyEvent;
export declare type FuncOneEvent = IFuncBeginEvent | IFuncEndEvent;
export declare type FuncManyEvent = IFuncManyBeginEvent | IFuncManyEndEvent;
export declare type IFuncBeginEvent = {
    type: 'FUNC/begin';
    payload: IFuncBegin;
};
export declare type IFuncBegin = {
    eid: string;
    cell: string;
    formula: string;
};
export declare type IFuncEndEvent = {
    type: 'FUNC/end';
    payload: IFuncEnd;
};
export declare type IFuncEnd = IFuncResponse;
export declare type IFuncManyBeginEvent = {
    type: 'FUNC/many/begin';
    payload: IFuncManyBegin;
};
export declare type IFuncManyBegin = {
    eid: string;
    cells: string[];
};
export declare type IFuncManyEndEvent = {
    type: 'FUNC/many/end';
    payload: IFuncManyEnd;
};
export declare type IFuncManyEnd = IFuncManyResponse;