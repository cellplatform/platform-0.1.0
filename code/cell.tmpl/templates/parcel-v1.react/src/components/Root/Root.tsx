import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue } from '../../common';
import { WindowTitleBar } from '../primitives';

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
      base: css({ Absolute: 0 }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
    };

    const uri = '';

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        {this.renderBody()}
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        Flex: 'center-center',
      }),
      hello: css({ fontSize: 50 }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.hello}>👋</div>
      </div>
    );
  }
}
