import * as React from 'react';
import { GlamorValue, datagrid } from './common';
export declare type ITestProps = {
    style?: GlamorValue;
    Table?: Handsontable;
};
export declare type ITestState = {
    settings?: datagrid.IGridSettings;
};
export declare class Test extends React.PureComponent<ITestProps, ITestState> {
    state: ITestState;
    private state$;
    private unmounted$;
    private events$;
    private grid;
    private gridRef;
    componentWillMount(): void;
    componentWillUnmount(): void;
    private readonly Table;
    render(): JSX.Element;
    private factory;
}
export declare function createEmptyData(rows: number, columns: number): string[][];
export declare function createSampleData(args: {
    Table: Handsontable;
}): import("handsontable").DefaultSettings;
