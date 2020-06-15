import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, color } from '../../common';
import { WindowTitleBar } from '../primitives';
import { Grid } from '../Grid';
import { Panel } from '../Panel';

export type IRootProps = { style?: CssValue };
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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
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
      base: css({ Absolute: 0, backgroundColor: color.format(1) }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        Flex: 'horizontal-stretch-stretch',
      }),
      grid: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
      panel: css({
        width: 250,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };

    const uri = ''; // TEMP 🐷

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          <div {...styles.grid}>
            <Grid style={{ Absolute: 0 }} />
          </div>
          <div {...styles.panel}>
            <Panel />
          </div>
        </div>
      </div>
    );
  }
}
