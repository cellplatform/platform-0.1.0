import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { Context, css, t, DEFAULT, util } from '../common';
const SHELL = DEFAULT.STATE.SHELL;

export type IHeaderProps = {};
export type IHeaderState = {};

export class Header extends React.PureComponent<IHeaderProps, IHeaderState> {
  public state: IHeaderState = {};
  private state$ = new Subject<Partial<IHeaderState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.model.changed$
      .pipe(takeUntil(this.unmounted$), debounceTime(0))
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
    return this.context.shell.state.header as t.IObservableProps<t.IShellHeaderState>;
  }

  public get height() {
    return util.toSize(this.model.height, SHELL.header.height);
  }

  public get colors() {
    const model = this.model;
    const { header } = SHELL;
    const foreground = util.toColor(model.foreground, header.foreground);
    const background = util.toColor(model.background, header.background);
    const border = util.toColor(model.border, header.border);
    return { foreground, background, border };
  }

  /**
   * [Render]
   */
  public render() {
    const height = this.height;
    const { foreground, background, border } = this.colors;

    let transition = '';
    transition += `color ${foreground.fadeSpeed}ms, `;
    transition += `background-color ${background.fadeSpeed}ms, `;
    transition += `border ${border.fadeSpeed}ms, `;
    transition += `height ${height.speed}ms`;

    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        color: foreground.color,
        backgroundColor: background.color,
        height: height.value,
        borderBottom: height.value > 0 ? util.toBorder(border.color) : undefined,
        transition,
      }),
    };
    return <div {...styles.base}>{this.model.el}</div>;
  }
}
