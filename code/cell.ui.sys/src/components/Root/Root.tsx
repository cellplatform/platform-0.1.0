import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';
import { WindowTitleBar, Card, ICardProps } from '../primitives';

export type IRootProps = { uri: string; env: t.IEnv; style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
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
    const { uri, env } = this.props;

    const styles = {
      base: css({ Absolute: 0 }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          {this.renderBody()}
          <div />
        </div>
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        flex: 1,
        padding: 30,
        Flex: 'horizontal-stretch-stretch',
      }),
      left: css({}),
      right: css({ flex: 1 }),
      windows: css({
        Flex: 'vertical',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.windows}>
            <InfoCard>Window: 1</InfoCard>
            <InfoCard>Window: 2</InfoCard>
            <InfoCard>Window: 3</InfoCard>
          </div>
        </div>
        <div {...styles.right}>
          <InfoCard>
            <div>HTTP Server</div>
            <div>{this.props.env.host}</div>
          </InfoCard>
        </div>
      </div>
    );
  }
}

/**
 * [Helpers]
 */

const InfoCard = (props?: ICardProps) => (
  <Card minWidth={180} minHeight={50} userSelect={false} padding={10} margin={6} {...props} />
);
