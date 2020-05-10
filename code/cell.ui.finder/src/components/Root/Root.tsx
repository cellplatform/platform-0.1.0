import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t } from '../../common';
import { WindowTitlebar } from '../primitives';
import { Viewer } from '../Viewer';

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
      base: css({
        Absolute: 0,
      }),
      titlebar: css({
        Absolute: [0, 0, null, 0],
      }),
      body: css({
        Absolute: [38, 0, 0, 0],
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitlebar style={styles.titlebar} text={uri} />
        <div {...styles.body}>
          <Viewer uri={uri} env={env} />
        </div>
      </div>
    );
  }
}
