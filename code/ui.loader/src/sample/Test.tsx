import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, COLORS } from '../common';
import { Splash, SplashFactory } from '../components/Splash';
import { loader } from '..';

// const modules = {
//   Foo: import('./Foo'),
// };

loader.add('foo', async () => {
  const Foo = (await import('./Foo')).Foo;
  return <Foo />;
});

export type ITestProps = { style?: GlamorValue };
export type ITestState = { foo?: JSX.Element };

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
    const { foo } = this.state;

    const styles = {
      base: css({
        Absolute: 0,
      }),
      foo: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };

    const elFoo = foo && <div {...styles.foo}>{foo}</div>;

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.handleClick}>
        <Splash theme={'DARK'} factory={this.splashFactory} />
        {elFoo}
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
        userSelect: 'none',
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

  /**
   * [Handlers]
   */
  private handleClick = async () => {
    const foo = await loader.render('foo');
    this.state$.next({ foo });
  };
}
