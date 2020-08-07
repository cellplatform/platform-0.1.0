import { Observable } from 'rxjs';
import * as t from '../common/types';

type N = t.ITreeviewNode;
type Button = t.MouseEvent['button'];
type Target = t.TreeViewMouseTarget;

export type TreeEvents = {
  create<N extends t.ITreeviewNode = t.ITreeviewNode>(
    event$: Observable<t.TreeviewEvent>,
    dispose$?: Observable<any>,
  ): t.ITreeEvents<N>;
};

export type ITreeEvents<T extends N = N> = {
  treeview$: Observable<t.TreeviewEvent>;
  render: ITreeRenderEvents<N>;
  mouse$(options?: {
    button?: Button[];
    type?: t.MouseEventType;
    target?: Target;
  }): Observable<t.ITreeviewMouse<T>>;
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
  $: Observable<t.ITreeviewMouse<T>>;
  node$: Observable<t.ITreeviewMouse<T>>;
  drillIn$: Observable<t.ITreeviewMouse<T>>;
  parent$: Observable<t.ITreeviewMouse<T>>;
  twisty$: Observable<t.ITreeviewMouse<T>>;
};

export type ITreeRenderEvents<T extends N = N> = {
  $: Observable<t.TreeviewRenderEvent['payload']>;
  icon$: Observable<t.ITreeviewRenderIcon<T>>;
  nodeBody$: Observable<t.ITreeviewRenderNodeBody<T>>;
  panel$: Observable<t.ITreeviewRenderPanel<T>>;
  header$: Observable<t.ITreeviewRenderHeader<T>>;
};
