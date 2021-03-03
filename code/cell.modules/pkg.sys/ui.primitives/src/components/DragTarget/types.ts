import * as t from '../../common/types';

/**
 * [Events]
 */

export type DragTargetEvent = DragTargetOverEvent | DragTargetDropEvent;

export type DragTargetOverEvent = {
  type: 'DragTarget/over';
  payload: DragTargetOver;
};
export type DragTargetOver = {
  isDragOver: boolean;
  isDropped: boolean;
};

export type DragTargetDropEvent = {
  type: 'DragTarget/drop';
  payload: DragTargetDrop;
};
export type DragTargetDrop = {
  urls: string[];
  dir: string;
  files: t.IHttpClientCellFileUpload[];
};
