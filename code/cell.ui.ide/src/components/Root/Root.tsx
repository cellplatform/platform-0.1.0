import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t } from '../../common';
import { WindowTitleBar, WindowFooterBar } from '../primitives';
import { Monaco } from '../Monaco';

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
        overflow: 'hidden',
      }),
      titlebar: css({
        Absolute: [0, 0, null, 0],
      }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
        Flex: 'vertical-strecth-stretch',
      }),
      editor: css({
        position: 'relative',
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          <div {...styles.editor}>
            <Monaco />
          </div>
          <WindowFooterBar>{this.renderFooter()}</WindowFooterBar>
        </div>
      </div>
    );
  }

  private renderFooter() {
    const styles = {
      base: css({
        // padding: 5,
        PaddingX: 10,
        Flex: 'center-start',
      }),
    };
    return (
      <div {...styles.base}>
        <div>Footer</div>
      </div>
    );
  }
}
