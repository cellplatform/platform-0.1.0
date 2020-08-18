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
  $: Observable<t.TreeviewEvent>;
  keyboard$: Observable<t.ITreeviewKeyboard>;
  render: ITreeRenderEvents<T>;
  beforeRender: ITreeBeforeRenderEvents<T>;
  mouse$(options?: {
    button?: Button | Button[];
    type?: t.MouseEventType;
    target?: Target;
  }): Observable<t.TreeNodeMouseEventHandlerArgs<T>>;
  mouse(
    options?:
      | Button
      | Button[]
      | {
          button?: Button | Button[];
        },
  ): {
    click: ITreeMouseEvents<T>;
    dblclick: ITreeMouseEvents<T>;
    down: ITreeMouseEvents<T>;
    up: ITreeMouseEvents<T>;
    enter: ITreeMouseEvents<T>;
    leave: ITreeMouseEvents<T>;
  };
};

export type ITreeMouseEvents<T extends N = N> = {
  $: Observable<t.TreeNodeMouseEventHandlerArgs<T>>;
  node$: Observable<t.TreeNodeMouseEventHandlerArgs<T>>;
  drillIn$: Observable<t.TreeNodeMouseEventHandlerArgs<T>>;
  parent$: Observable<t.TreeNodeMouseEventHandlerArgs<T>>;
  twisty$: Observable<t.TreeNodeMouseEventHandlerArgs<T>>;
};

export type ITreeRenderEvents<T extends N = N> = {
  $: Observable<t.TreeviewRenderEvent['payload']>;
  icon$: Observable<t.ITreeviewRenderIcon<T>>;
  nodeBody$: Observable<t.ITreeviewRenderNodeBody<T>>;
  panel$: Observable<t.ITreeviewRenderPanel<T>>;
  header$: Observable<t.ITreeviewRenderHeader<T>>;
};

export type ITreeBeforeRenderEvents<T extends N = N> = {
  $: Observable<t.TreeviewBeforeRenderEvent['payload']>;
  node$: Observable<t.ITreeviewBeforeRenderNode<T>>;
  header$: Observable<t.ITreeviewBeforeRenderHeader<T>>;
};
