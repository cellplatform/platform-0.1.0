import * as t from '../../common/types';

/**
 * [Events]
 */

export type DragTargetEvent = IDragTargetOverEvent | IDragTargetDropEvent;

export type IDragTargetOverEvent = {
  type: 'cell.ui/DragTarget/over';
  payload: IDragTargetOver;
};
export type IDragTargetOver = {
  isDragOver: boolean;
  isDropped: boolean;
};

export type IDragTargetDropEvent = {
  type: 'cell.ui/DragTarget/drop';
  payload: IDragTargetDrop;
};
export type IDragTargetDrop = {
  urls: string[];
  dir: string;
  files: t.IHttpClientCellFileUpload[];
};
