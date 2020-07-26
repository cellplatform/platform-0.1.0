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
  }): Observable<t.TreeViewMouse<N>>;
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
  $: Observable<t.TreeViewMouse<N>>;
  node$: Observable<t.TreeViewMouse<N>>;
  drillIn$: Observable<t.TreeViewMouse<N>>;
  parent$: Observable<t.TreeViewMouse<N>>;
  twisty$: Observable<t.TreeViewMouse<N>>;
};
