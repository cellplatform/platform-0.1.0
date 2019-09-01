import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { Context, css, t, DEFAULT, util } from '../common';
const SHELL = DEFAULT.STATE.SHELL;

export type ISidebarProps = {};
export type ISidebarState = {};

export class Sidebar extends React.PureComponent<ISidebarProps, ISidebarState> {
  public state: ISidebarState = {};
  private state$ = new Subject<Partial<ISidebarState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: ISidebarProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    this.model.changed$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
      )
      .subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get model() {
    return this.context.shell.state.sidebar as t.IObservableProps<t.IShellSidebarState>;
  }

  public get colors() {
    const { sidepanel } = SHELL;
    const foreground = util.toColor(this.model.foreground, sidepanel.foreground);
    const background = util.toColor(this.model.background, sidepanel.background);
    return { foreground, background };
  }

  /**
   * [Render]
   */
  public render() {
    const { foreground, background } = this.colors;
    const transition = `color ${background.fadeSpeed}ms, background-color ${background.fadeSpeed}ms`;
    const styles = {
      base: css({
        Absolute: 0,
        color: foreground.color,
        backgroundColor: background.color,
        transition,
      }),
    };
    return <div {...styles.base}>{this.model.el}</div>;
  }
}
