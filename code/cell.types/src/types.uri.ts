/**
 * URI
 */
export type UriType = IUri['type'];
export type IUri = INsUri | IUriCoord | IUnknownUri;
export type IUriCoord = ICellUri | IRowUri | IColumnUri;

export type INsUri = { type: 'ns'; id: string };
export type ICellUri = { type: 'cell'; id: string; ns: string; cell: string };
export type IRowUri = { type: 'row'; id: string; ns: string; row: string };
export type IColumnUri = { type: 'col'; id: string; ns: string; column: string };
export type IUnknownUri = { type: 'UNKNOWN' };
