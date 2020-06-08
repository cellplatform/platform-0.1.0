import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

export type IWindowProps = { style?: CssValue };
export type IWindowState = {};

export class Window extends React.PureComponent<IWindowProps, IWindowState> {
  public state: IWindowState = {};
  private state$ = new Subject<Partial<IWindowState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowProps) {
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
        Absolute: 0,
        WebkitAppRegion: 'drag',
        Flex: 'center-center',
        userSelect: 'none',
      }),
      label: css({
        fontWeight: 'bolder',
        fontSize: 24,
        letterSpacing: -0.8,
        color: color.format(0.8),
        cursor: 'default',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.label}>Drag to add Application</div>
      </div>
    );
  }
}
