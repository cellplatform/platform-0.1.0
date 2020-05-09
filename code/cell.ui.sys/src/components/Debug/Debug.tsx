import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue, t } from '../../common';
import { DeclareApp } from '../DeclareApp';

export type IDebugProps = {
  uri: t.IRowUri;
  env: t.IEnv;
  style?: CssValue;
};
export type IDebugState = {};

export class Debug extends React.PureComponent<IDebugProps, IDebugState> {
  public state: IDebugState = {};
  private state$ = new Subject<Partial<IDebugState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDebugProps) {
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
        Flex: 'vertical-stretch-stretch',
        color: COLORS.DARK,
      }),
      top: css({
        WebkitAppRegion: 'drag',
        position: 'relative',
        Flex: 'center-center',
        height: 40,
        boxSizing: 'border-box',
        borderBottom: `solid 1px ${color.format(-0.15)}`,
        background: `linear-gradient(180deg, #E5E5E5 0%, #CDCDCD 100%)`,
        userSelect: 'none',
      }),
      bottom: css({
        flex: 1,
        position: 'relative',
        display: 'flex',
        // padding: 14,
      }),
      uri: css({
        backgroundColor: color.format(1),
        border: `solid 1px ${color.format(-0.2)}`,
        borderRadius: 4,
        fontSize: 13,
        PaddingX: 100,
        PaddingY: 5,
        // boxShadow: `0 1px 2px 0 ${color.format(-0.07)}`,
      }),
    };

    // linear-gradient(180deg, #E5E5E5 0%, #CDCDCD 100%);

    const uri = this.props.uri.toString();

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.top}>
          <div {...styles.uri}>{uri}</div>
        </div>
        <div {...styles.bottom}>
          <DeclareApp env={this.props.env} />
        </div>
      </div>
    );
  }
}
