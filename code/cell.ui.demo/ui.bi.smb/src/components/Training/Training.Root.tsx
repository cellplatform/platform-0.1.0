import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue } from '../../common';

export type TrainingIRootProps = { nodeId: string; style?: CssValue };
export type TrainingIRootState = {};

export class TrainingRoot extends React.PureComponent<TrainingIRootProps, TrainingIRootState> {
  public state: TrainingIRootState = {};
  private state$ = new Subject<Partial<TrainingIRootState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  constructor(props: TrainingIRootProps) {
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
    const { nodeId: node } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>{node === 'intro' && this.renderIntro()}</div>
    );
  }

  private renderIntro() {
    const styles = {
      base: css({
        Flex: 'center-center',
        color: COLORS.WHITE,
        Absolute: 0,
      }),
    };
    return <div {...styles.base}></div>;
  }
}
