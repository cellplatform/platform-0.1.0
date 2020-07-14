import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { Context, css, t, DEFAULT, util, CssValue } from '../common';
const SHELL = DEFAULT.STATE.SHELL;

export type IBodyProps = { style?: CssValue };

export class Body extends React.PureComponent<IBodyProps> {
  private unmounted$ = new Subject();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
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
    return this.context.shell.state.body as t.IObservableProps<t.IShellBodyState>;
  }

  public get colors() {
    const { body } = SHELL;
    const foreground = util.toColor(this.model.foreground, body.foreground);
    const background = util.toColor(this.model.background, body.background);
    return { foreground, background };
  }

  /**
   * [Render]
   */
  public render() {
    const { foreground, background } = this.colors;
    const transition = `color ${foreground.fadeSpeed}ms, background-color ${background.fadeSpeed}ms`;
    const styles = {
      base: css({
        Absolute: 0,
        color: foreground.color,
        backgroundColor: background.color,
        transition,
      }),
    };
    return <div {...css(styles.base, this.props.style)}>{this.model.el}</div>;
  }
}
