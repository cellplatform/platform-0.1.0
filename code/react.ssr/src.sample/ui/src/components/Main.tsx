import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, is } from '../common';

export type IMainProps = { style?: CssValue };
export type IMainState = { count?: number; foo?: JSX.Element };

export class Main extends React.PureComponent<IMainProps, IMainState> {
  public state: IMainState = {};
  private state$ = new Subject<Partial<IMainState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IMainProps) {
    super(props);
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get count() {
    return this.state.count || 0;
  }

  public get version() {
    const el = is.browser ? document.getElementById('root') : undefined;
    return (el && el.getAttribute('data-version')) || 'loading...';
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        PaddingX: 50,
        PaddingY: 20,
        userSelect: 'none',
      }),
      title: css({
        fontSize: 34,
        marginBottom: 10,
      }),
      image: css({ borderRadius: 8 }),
      version: css({
        Absolute: [5, 10, null, null],
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} onClick={this.handleClick}>
        <div {...styles.title}>Kitty: {this.count || 0}</div>
        <div {...styles.version}>{this.version}</div>
        <img src='/images/cat.jpg' {...styles.image} />
        {this.state.foo}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleClick = async () => {
    this.state$.next({ count: this.count + 1 });

    const foo = import('./Foo');
    const Foo: any = await foo;
    const el = <Foo.Foo />;

    this.state$.next({ foo: el });
  };
}
