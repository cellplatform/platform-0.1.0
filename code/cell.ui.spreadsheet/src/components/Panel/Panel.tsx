import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, ui, t } from '../../common';

export type IPanelProps = { style?: CssValue };
export type IPanelState = {};

export class Panel extends React.PureComponent<IPanelProps, IPanelState> {
  public state: IPanelState = {};
  private state$ = new Subject<Partial<IPanelState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IPanelProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.load();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public async load() {
    //
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0 }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>SheetPanel</div>
      </div>
    );
  }
}
