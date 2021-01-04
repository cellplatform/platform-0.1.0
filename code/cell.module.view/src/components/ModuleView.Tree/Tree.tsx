import { Tree, Treeview, TreeviewColumns } from '@platform/ui.tree';
import { ITreeviewProps } from '@platform/ui.tree/lib/components/Treeview';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { CssValue, dispose, t } from '../../common';

type N = t.ITreeviewNode;
type E = t.TreeviewEvent;

export type IModuleViewTreeProps = {
  totalColumns?: number;
  module?: t.IModule;
  strategy?: (fire: t.FireEvent) => t.ITreeviewStrategy;
  treeviewProps?: ITreeviewProps;
  focusOnLoad?: boolean;
  treeview$?: Subject<t.TreeviewEvent>;
  style?: CssValue;
};

export type IModuleViewTreeState = { current?: t.IDisposable };

export class ModuleViewTree extends React.PureComponent<
  IModuleViewTreeProps,
  IModuleViewTreeState
> {
  public static Strategy = Tree.Strategy;

  public static events<T extends N = N>(event$: Observable<E>, until$?: Observable<any>) {
    return Tree.View.events<T>(event$, until$);
  }

  public state: IModuleViewTreeState = {};
  private state$ = new Subject<Partial<IModuleViewTreeState>>();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private unmounted$ = new Subject<void>();

  private elTree!: Treeview;
  private elTreeRef = (ref: Treeview) => (this.elTree = ref);

  private elTreeColumns!: TreeviewColumns;
  private elTreeColumnsRef = (ref: TreeviewColumns) => (this.elTreeColumns = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.treeview$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.props.treeview$?.next(e));
    this.init();
  }

  public componentDidUpdate(prev: IModuleViewTreeProps) {
    const next = this.props;
    if (prev.module?.id !== next.module?.id) {
      this.init();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private init() {
    this.state.current?.dispose();
    this.state$.next({ current: undefined });

    const tree = this.props.module;
    if (tree) {
      const disposable = dispose.create(this.unmounted$);
      const until$ = disposable.dispose$;

      // Setup the behavior strategy.
      const fire = this.fire;

      const strategy = this.props.strategy
        ? this.props.strategy(fire as t.FireEvent)
        : Tree.Strategy.default({ fire });

      const events = Tree.View.events(this.treeview$, until$);
      events.$.subscribe((event) => strategy.next({ tree, event }));

      // Redraw on change.
      tree.event.changed$
        .pipe(takeUntil(this.unmounted$), debounceTime(10))
        .subscribe((e) => this.forceUpdate());

      // Re-render the component.
      this.state$.next({ current: { ...disposable } });
    }
  }

  /**
   * [Properties]
   */
  private get root() {
    return this.props.module?.state as t.ITreeviewNode;
  }

  private get nav() {
    return this.root?.props?.treeview?.nav || {};
  }

  private get totalColumns() {
    return this.props.totalColumns;
  }

  private get view() {
    const total = this.totalColumns;
    return typeof total === 'number' && total > 1 ? 'COLUMNS' : 'SINGLE';
  }

  /**
   * [Methods]
   */

  public focus() {
    if (this.view === 'COLUMNS' && this.elTreeColumns) {
      this.elTreeColumns.focus();
    }
    if (this.view === 'SINGLE' && this.elTree) {
      this.elTree.focus();
    }
  }

  /**
   * [Render]
   */
  public render() {
    const root = this.root;
    if (!root) {
      return null;
    }

    const props: ITreeviewProps = {
      background: 'NONE',
      tabIndex: 0,
      ...this.props.treeviewProps,
      style: this.props.style,
      root,
      current: this.nav.current,
      event$: this.treeview$,
      focusOnLoad: this.props.focusOnLoad,
    };

    if (this.view === 'COLUMNS') {
      return <TreeviewColumns ref={this.elTreeColumnsRef} {...props} total={this.totalColumns} />;
    } else {
      return <Treeview ref={this.elTreeRef} {...props} />;
    }
  }

  /**
   * [Helpers]
   */

  private fire: t.FireEvent<t.TreeviewEvent> = (e) => this.treeview$.next(e);
}
