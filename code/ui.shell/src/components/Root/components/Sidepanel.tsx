import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { Context, css, t, DEFAULT, util } from '../../common';
const SHELL = DEFAULT.STATE.SHELL;

export type ISidepanelProps = {};
export type ISidepanelState = {};

export class Sidepanel extends React.PureComponent<ISidepanelProps, ISidepanelState> {
  public state: ISidepanelState = {};
  private state$ = new Subject<Partial<ISidepanelState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: ISidepanelProps) {
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
    return this.context.shell.state.sidepanel as t.IObservableProps<t.IShellSidepanelState>;
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
