import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ui, css, CssValue } from '../../common';

export type ITreeShellProps = { style?: CssValue };
export type ITreeShellState = {};

export class TreeShell extends React.PureComponent<ITreeShellProps, ITreeShellState> {
  public state: ITreeShellState = {};
  private state$ = new Subject<Partial<ITreeShellState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: ui.IEnvContext;

  /**
   * [Lifecycle]
   */
  constructor(props: ITreeShellProps) {
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
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TreeShell</div>
      </div>
    );
  }
}
