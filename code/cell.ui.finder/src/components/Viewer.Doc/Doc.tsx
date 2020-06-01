import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue } from '../../common';
import { DocPage } from './Doc.Page';
import { Text } from '../primitives';

export type IDocProps = {
  children?: React.ReactNode;
  depth?: number;
  background?: string | number | React.ReactNode;
  backgroundBlur?: number;
  style?: CssValue;
};
export type IDocState = {};

export class Doc extends React.PureComponent<IDocProps, IDocState> {
  public state: IDocState = {};
  private state$ = new Subject<Partial<IDocState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDocProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get depth() {
    const { depth = 0 } = this.props;
    return Math.max(0, depth);
  }

  public get blur() {
    const { backgroundBlur } = this.props;

    if (typeof backgroundBlur === 'number') {
      return backgroundBlur;
    }

    const depth = this.depth;
    if (depth > 0) {
      return 8;
    }

    return 0;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        overflow: 'hidden',
      }),
      highlight: css({
        Absolute: [0, null, 0, 0],
        width: 12,
        backgroundColor: color.format(0.1),
      }),
    };

    return (
      <Text style={css(styles.base, this.props.style)}>
        {this.renderBackground()}
        {this.depth < 1 && <Text {...styles.highlight} />}
        {this.renderBody()}
      </Text>
    );
  }

  private renderBackground() {
    const { background } = this.props;

    if (typeof background === 'object') {
      return background; // NB: A {React.ReactNode}.
    }

    if (typeof background === 'number') {
      return this.renderBackgroundColor(background);
    }

    if (typeof background === 'string') {
      if (!(background.includes('http://') || background.includes('https://'))) {
        return this.renderBackgroundColor(background);
      }
      return this.renderBackgroundImage(background);
    }

    return null;
  }

  private renderBackgroundColor = (background: string | number) => {
    const style = css({
      Absolute: 0,
      backgroundColor: color.format(background),
    });
    return <div {...style}></div>;
  };

  private renderBackgroundImage = (url: string) => {
    if (url.startsWith('http://')) {
      throw new Error(`Can only render images over [https]. ${url}`);
    }

    const render = (args: { blur?: number } = {}) => {
      const styles = {
        base: css({
          Absolute: -10,
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: `blur(${args.blur || 0}px)`,
        }),
      };
      return <div {...styles.base}></div>;
    };

    const blur = this.blur;
    return (
      <React.Fragment>
        {render({})}
        {blur > 0 && render({ blur })}
      </React.Fragment>
    );
  };

  private renderBody() {
    const { children } = this.props;
    const styles = {
      base: css({ Absolute: 0, display: 'flex' }),
    };
    const depth = this.depth;
    const el = depth === 0 ? children : this.renderPage();
    return <div {...styles.base}>{el}</div>;
  }

  private renderPage() {
    const { children } = this.props;
    const depth = this.depth;
    const styles = {
      base: css({
        Absolute: [20, 40, 0, 40],
        display: 'flex',
        justifyContent: 'center',
      }),
    };
    return (
      <div {...styles.base}>
        <DocPage depth={depth}>{children}</DocPage>
      </div>
    );
  }
}
