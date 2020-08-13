import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, COLORS, css, CssValue, t } from './common';

export type ITest404Props = { view: string; style?: CssValue };
export type ITest404State = t.Object;

export class Test404 extends React.PureComponent<ITest404Props, ITest404State> {
  public state: ITest404State = {};
  private state$ = new Subject<Partial<ITest404State>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  constructor(props: ITest404Props) {
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
        flex: 1,
        Flex: 'center-center',
        color: COLORS.DARK,
      }),
      body: css({
        Flex: 'vertical-center-center',
        textAlign: 'center',
      }),
      view: css({
        margin: 0,
        marginTop: 6,
        paddingTop: 7,
        fontFamily: 'Menlo, monospace',
        color: COLORS.CLI.MAGENTA,
        fontSize: 12,
        borderTop: `solid 3px ${color.format(-0.06)}`,
        minWidth: 300,
      }),
    };

    const view = this.props.view ? `"${this.props.view}"` : '<empty>';

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div>Not Found</div>
          <div {...styles.view}>view: {view}</div>
        </div>
      </div>
    );
  }
}
