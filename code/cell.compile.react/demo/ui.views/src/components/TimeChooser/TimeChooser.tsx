import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

export type ITimeChooserProps = { style?: CssValue };
export type ITimeChooserState = {};

export class TimeChooser extends React.PureComponent<ITimeChooserProps, ITimeChooserState> {
  public state: ITimeChooserState = {};
  private state$ = new Subject<Partial<ITimeChooserState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: ITimeChooserProps) {
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
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TimeChooser</div>
      </div>
    );
  }
}
