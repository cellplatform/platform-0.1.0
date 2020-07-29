import { Observable } from 'rxjs';
import * as t from '../common/types';

type N = t.ITreeViewNode;
type Button = t.MouseEvent['button'];
type Target = t.TreeViewMouseTarget;

export type TreeEvents = {
  create<N extends t.ITreeViewNode = t.ITreeViewNode>(
    event$: Observable<t.TreeViewEvent>,
    dispose$?: Observable<any>,
  ): t.ITreeEvents<N>;
};

export type ITreeEvents<T extends N = N> = {
  treeview$: Observable<t.TreeViewEvent>;
  render: ITreeRenderEvents<N>;
  mouse$(options?: {
    button?: Button[];
    type?: t.MouseEventType;
    target?: Target;
  }): Observable<t.ITreeViewMouse<T>>;
  mouse(options?: {
    button?: Button | Button[];
  }): {
    click: ITreeMouseEvents<T>;
    dblclick: ITreeMouseEvents<T>;
    down: ITreeMouseEvents<T>;
    up: ITreeMouseEvents<T>;
    enter: ITreeMouseEvents<T>;
    leave: ITreeMouseEvents<T>;
  };
};

export type ITreeMouseEvents<T extends N = N> = {
  $: Observable<t.ITreeViewMouse<T>>;
  node$: Observable<t.ITreeViewMouse<T>>;
  drillIn$: Observable<t.ITreeViewMouse<T>>;
  parent$: Observable<t.ITreeViewMouse<T>>;
  twisty$: Observable<t.ITreeViewMouse<T>>;
};

export type ITreeRenderEvents<T extends N = N> = {
  $: Observable<t.TreeViewRenderEvent['payload']>;
  icon$: Observable<t.ITreeViewRenderIcon<T>>;
  nodeBody$: Observable<t.ITreeViewRenderNodeBody<T>>;
  panel$: Observable<t.ITreeViewRenderPanel<T>>;
};
