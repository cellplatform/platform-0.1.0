import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

export type ILoadSplashProps = { style?: CssValue };
export type ILoadSplashState = {};

export class LoadSplash extends React.PureComponent<ILoadSplashProps, ILoadSplashState> {
  public state: ILoadSplashState = {};
  private state$ = new Subject<Partial<ILoadSplashState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ILoadSplashProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Loading...</div>
      </div>
    );
  }
}
