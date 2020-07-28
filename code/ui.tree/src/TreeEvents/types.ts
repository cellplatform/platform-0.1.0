import { Observable } from 'rxjs';
import * as t from '../common/types';

type Button = t.MouseEvent['button'];
type Target = t.TreeViewMouseTarget;

export type TreeEvents = {
  create<N extends t.ITreeViewNode = t.ITreeViewNode>(
    event$: Observable<t.TreeViewEvent>,
    dispose$?: Observable<any>,
  ): t.ITreeEvents<N>;
};

export type ITreeEvents<N extends t.ITreeViewNode = any> = {
  event$: Observable<t.TreeViewEvent>;
  mouse$(options?: {
    button?: Button[];
    type?: t.MouseEventType;
    target?: Target;
  }): Observable<t.ITreeViewMouse<N>>;
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

export type ITreeMouseEvents<N extends t.ITreeViewNode = any> = {
  $: Observable<t.ITreeViewMouse<N>>;
  node$: Observable<t.ITreeViewMouse<N>>;
  drillIn$: Observable<t.ITreeViewMouse<N>>;
  parent$: Observable<t.ITreeViewMouse<N>>;
  twisty$: Observable<t.ITreeViewMouse<N>>;
};
