import { Observable } from 'rxjs';
import * as t from '../common/types';

type Button = t.MouseEvent['button'];
type Target = t.TreeNodeMouseTarget;

export type TreeEvents = {
  create<N extends t.ITreeNode = t.ITreeNode>(
    event$: Observable<t.TreeViewEvent>,
    dispose$?: Observable<any>,
  ): t.ITreeEvents<N>;
};

export type ITreeEvents<N extends t.ITreeNode = any> = {
  event$: Observable<t.TreeViewEvent>;
  mouse$(options?: {
    button?: Button[];
    type?: t.MouseEventType;
    target?: Target;
  }): Observable<t.TreeNodeMouseEvent<N>>;
  mouse(options?: {
    button?: Button[];
  }): {
    click: ITreeMouseEvents<N>;
    dblclick: ITreeMouseEvents<N>;
    down: ITreeMouseEvents<N>;
    up: ITreeMouseEvents<N>;
    enter: ITreeMouseEvents<N>;
    leave: ITreeMouseEvents<N>;
  };
};

export type ITreeMouseEvents<N extends t.ITreeNode = any> = {
  all$: Observable<t.TreeNodeMouseEvent<N>>;
  node$: Observable<t.TreeNodeMouseEvent<N>>;
  drillIn$: Observable<t.TreeNodeMouseEvent<N>>;
  parent$: Observable<t.TreeNodeMouseEvent<N>>;
  twisty$: Observable<t.TreeNodeMouseEvent<N>>;
};
