/**
 * URI
 */
export type UriType = IUri['type'];
export type IUri = INsUri | ICoordUri | IUnknownUri;

export type IUnknownUri = { type: 'UNKNOWN' };
export type INsUri = { type: 'ns'; id: string };

export type ICoordUri = ICellUri | IRowUri | IColumnUri;
export type ICoordUriProps = { id: string; key: string; ns: string };
export type ICellUri = ICoordUriProps & { type: 'cell' };
export type IRowUri = ICoordUriProps & { type: 'row' };
export type IColumnUri = ICoordUriProps & { type: 'col' };
