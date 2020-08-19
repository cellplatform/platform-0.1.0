import { ITreeviewProps } from '@platform/ui.tree/lib/components/Treeview';
import { Tree } from '@platform/ui.tree';
import { TreeviewStrategy } from '@platform/ui.tree/lib/TreeviewStrategy';
import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { CssValue, dispose, t } from '../common';

export type IModuleViewTreeProps = {
  totalColumns?: number;
  module?: t.IModule;
  strategy?: (fire: t.FireEvent) => t.ITreeviewStrategy;
  treeviewProps?: ITreeviewProps;
  focusOnLoad?: boolean;
  style?: CssValue;
};

export type IModuleViewTreeState = {
  current?: t.IDisposable;
};

export class ModuleViewTree extends React.PureComponent<
  IModuleViewTreeProps,
  IModuleViewTreeState
> {
  public static Strategy = TreeviewStrategy;

  public state: IModuleViewTreeState = {};
  private state$ = new Subject<Partial<IModuleViewTreeState>>();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
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
        : TreeviewStrategy.default({ fire });

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
    return this.props.module?.root;
  }

  private get nav() {
    return this.root?.props?.treeview?.nav || {};
  }

  /**
   * [Render]
   */

  public render() {
    const root = this.root;
    if (!root) {
      return null;
    }

    const total = this.props.totalColumns;

    const props: ITreeviewProps = {
      background: 'NONE',
      tabIndex: 0,
      ...this.props.treeviewProps,
      style: this.props.style,
      root: root,
      current: this.nav.current,
      event$: this.treeview$,
      focusOnLoad: this.props.focusOnLoad,
    };

    if (typeof total === 'number' && total > 1) {
      return <Tree.Columns {...props} total={total} />;
    } else {
      return <Tree.View {...props} />;
    }
  }

  /**
   * [Helpers]
   */

  private fire: t.FireEvent<t.TreeviewEvent> = (e) => this.treeview$.next(e);
}
