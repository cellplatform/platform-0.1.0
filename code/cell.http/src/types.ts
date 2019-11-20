import * as t from '@platform/cell.types';

/**
 * Namespace
 */
export type ReqNsQueryCoord = string; // Eg: "A1", "A", "1", "A2,B,10,C1:C9"
export type ReqNsQueryData = 'cells' | 'columns' | 'rows' | 'ns' | true | ReqNsQueryCoord;

export type IReqNsParams = { id: string };
export type IReqNsQuery = { data?: ReqNsQueryData };

/**
 * Namespace: GET
 */
export type IGetNsResponse = {
  uri: string;
  exists: boolean;
  createdAt: number;
  modifiedAt: number;
  hash: string;
  data: Partial<t.INsData>;
};

/**
 * Namespace: POST
 */
export type IPostNsBody = { data?: Partial<t.INsData> };
export type IPostNsResponse = IGetNsResponse;
