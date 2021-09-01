import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';
import { rx } from '@platform/util.value';

import { t } from '../common';

type N = t.ITreeviewNode;
type E = t.TreeviewEvent;
type Button = t.MouseEvent['button'];
type Target = t.TreeViewMouseTarget;

/**
 * Helpers for filtering different event streams for a tree with sensible defaults.
 */
export class TreeEvents<T extends N = N> implements t.ITreeEvents<T> {
  public static create<T extends N = N>(
    event$: Observable<E>,
    until$?: Observable<any>,
  ): t.ITreeEvents<T> {
    return new TreeEvents<T>(event$, until$);
  }

  /**
   * [Lifecycle]
   */
  private constructor(event$: Observable<E>, until$?: Observable<any>) {
    this.$ = event$.pipe(takeUntil(this.dispose$));
    this.keyboard$ = rx.payload<t.ITreeviewKeyboardEvent>(this.$, 'TREEVIEW/keyboard');
    if (until$) {
      until$.subscribe(() => this.dispose());
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _render: t.ITreeRenderEvents<T>;
  private _beforeRender: t.ITreeBeforeRenderEvents<T>;

  public readonly $: Observable<E>;
  public readonly keyboard$: Observable<t.ITreeviewKeyboard>;

  private readonly _dispose$ = new Subject<void>();
  public readonly dispose$ = this._dispose$.pipe(share());

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get beforeRender() {
    if (!this._beforeRender) {
      const event$ = this.$.pipe(
        filter((e) => e.type.startsWith('TREEVIEW/beforeRender/')),
        map((e) => e as t.TreeviewBeforeRenderEvent),
      );
      const $ = event$.pipe(map((e) => e.payload as t.TreeviewBeforeRenderEvent['payload']));

      const node$ = event$.pipe(
        filter((e) => e.type === 'TREEVIEW/beforeRender/node'),
        map((e) => e.payload as t.ITreeviewBeforeRenderNode<T>),
      );

      const header$ = event$.pipe(
        filter((e) => e.type === 'TREEVIEW/beforeRender/header'),
        map((e) => e.payload as t.ITreeviewBeforeRenderHeader<T>),
      );

      this._beforeRender = { $, node$, header$ };
    }
    return this._beforeRender;
  }

  public get render() {
    if (!this._render) {
      const event$ = this.$.pipe(
        filter((e) => e.type.startsWith('TREEVIEW/render/')),
        map((e) => e as t.TreeviewRenderEvent),
      );
      const $ = event$.pipe(map((e) => e.payload as t.TreeviewRenderEvent['payload']));
      const icon$ = event$.pipe(
        filter((e) => e.type === 'TREEVIEW/render/icon'),
        map((e) => e.payload as t.ITreeviewRenderIcon<T>),
      );
      const nodeBody$ = event$.pipe(
        filter((e) => e.type === 'TREEVIEW/render/nodeBody'),
        map((e) => e.payload as t.ITreeviewRenderNodeBody<T>),
      );
      const panel$ = event$.pipe(
        filter((e) => e.type === 'TREEVIEW/render/panel'),
        map((e) => e.payload as t.ITreeviewRenderPanel<T>),
      );
      const header$ = event$.pipe(
        filter((e) => e.type === 'TREEVIEW/render/header'),
        map((e) => e.payload as t.ITreeviewRenderHeader<T>),
      );
      this._render = { $, icon$, nodeBody$, panel$, header$ };
    }
    return this._render;
  }

  /**
   * [Methods]
   */
  public mouse$ = (
    options: { button?: Button | Button[]; type?: t.MouseEventType; target?: Target } = {},
  ) => {
    const { type, target } = options;
    const buttons = toButtons(options.button);

    return this.$.pipe(
      filter((e) => e.type === 'TREEVIEW/mouse'),
      map((e) => e.payload as t.ITreeviewMouse<T>),
      filter((e) => {
        if (buttons.includes('RIGHT') && type === 'CLICK' && e.type === 'UP') {
          // NB: The CLICK event for a right button does not fire from the DOM
          //     so catch this pattern and return it as a "right-click" as its
          //     actually logical.
          return true;
        }
        return type ? e.type === type : true;
      }),
      filter((e) => buttons.includes(e.button)),
      filter((e) => (target ? e.target === target : true)),
    );
  };

  public mouse(options: Button | Button[] | { button?: Button | Button[] } = {}) {
    const button = toButtons(
      Array.isArray(options) || typeof options === 'string' ? options : options.button,
    );

    const mouse$ = this.mouse$;
    const targets = (type: t.MouseEventType) => {
      const args = { button, type };
      return {
        get $() {
          return mouse$({ ...args });
        },
        get node$() {
          return mouse$({ ...args, target: 'NODE' });
        },
        get drillIn$() {
          return mouse$({ ...args, target: 'DRILL_IN' });
        },
        get parent$() {
          return mouse$({ ...args, target: 'PARENT' });
        },
        get twisty$() {
          return mouse$({ ...args, target: 'TWISTY' });
        },
      };
    };
    return {
      get click() {
        return targets('CLICK');
      },
      get dblclick() {
        return targets('DOUBLE_CLICK');
      },
      get down() {
        return targets('DOWN');
      },
      get up() {
        return targets('UP');
      },
      get enter() {
        return targets('ENTER');
      },
      get leave() {
        return targets('LEAVE');
      },
    };
  }
}

/**
 * [Helpers]
 */

function toButtons(input?: Button | Button[], defaultValue: Button[] = ['LEFT']) {
  const buttons: Button[] = !input ? [] : Array.isArray(input) ? input : [input];
  return buttons.length === 0 ? defaultValue : buttons;
}
