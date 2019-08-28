import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, COLORS } from '../common';
import { Splash, SplashFactory } from '../components/Splash';

export type ITestProps = { style?: GlamorValue };
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ITestProps) {
    super(props);
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Splash theme={'DARK'} factory={this.splashFactory} />
      </div>
    );
  }

  private splashFactory: SplashFactory = args => {
    const { theme, type } = args;
    const filename = theme === 'LIGHT' ? 'acme-dark' : 'acme-light';
    const logo = [`/images/logo/${filename}.png`, `/images/logo/${filename}@2x.png`, 169, 32];

    // if (type === 'TOP_LEFT') {
    //   const style = css({ Image: logo, marginLeft: 15, marginTop: 10 });
    //   return <div {...style} />;
    // }

    // if (type === 'TOP_RIGHT') {
    //   const style = css({ Image: logo, marginRight: 15, marginTop: 10 });
    //   return <div {...style} />;
    // }

    if (type === 'BOTTOM_LEFT') {
      const style = css({
        marginLeft: 10,
        marginBottom: 10,
        fontSize: 14,
        opacity: 0.4,
        color: theme === 'DARK' ? COLORS.WHITE : COLORS.DARK,
      });
      const message = `© ${new Date().getFullYear()}, Acme Inc.`;
      return <div {...style}>{message}</div>;
    }

    if (type === 'BOTTOM_RIGHT') {
      const style = css({ Image: logo, marginRight: 15, marginBottom: 10 });
      return <div {...style} />;
    }

    return undefined;
  };
}
