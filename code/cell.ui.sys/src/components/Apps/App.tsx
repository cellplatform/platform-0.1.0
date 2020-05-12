import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t } from '../../common';
import { Card, IPropListItem, PropList } from '../primitives';

export type IAppProps = {
  env: t.IEnv;
  name: string;
  uri: string;
  windows: t.ITypedSheetData<t.AppWindow>;
  style?: CssValue;
};
export type IAppState = {};

export class App extends React.PureComponent<IAppProps, IAppState> {
  public state: IAppState = {};
  private state$ = new Subject<Partial<IAppState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IAppProps) {
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
   * [Methods]
   */

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        fontSize: 14,
        Flex: 'vertical-stretch-stretch',
      }),
      card: css({
        marginBottom: 30,
      }),
      body: css({
        PaddingY: 10,
        paddingLeft: 15,
        paddingRight: 15,
      }),
      title: css({
        borderBottom: `solid 1px ${color.format(-0.2)}`,
        PaddingX: 10,
        PaddingY: 8,
        backgroundColor: color.format(-0.03),
        Flex: 'horizontal-stretch-spaceBetween',
        fontSize: 11,
        opacity: 0.5,
        userSelect: 'none',
      }),
    };

    const name = this.props.name.replace(/^@platform\//, '');

    return (
      <div {...css(styles.base, this.props.style)}>
        <Card style={styles.card}>
          <div>
            <div {...styles.title}>
              <div>module</div>
              <div>{name}</div>
            </div>
            <div {...styles.body}>{this.renderWindows()}</div>
          </div>
        </Card>
      </div>
    );
  }

  private renderWindows() {
    const { windows } = this.props;
    if (!windows) {
      return null;
    }
    const styles = {
      base: css({}),
    };

    const elList = windows.rows.map((row, i) => {
      const { x, y, width, height } = row.props;
      const items: IPropListItem[] = [
        { label: 'uri', value: row.uri.toString() },
        { label: 'position', value: `${x} x ${y}` },
        { label: 'size', value: `${width} x ${height}` },
      ];
      return <PropList key={i} title={`Window (${i + 1})`} items={items} />;
    });

    return <div {...styles.base}>{elList}</div>;
  }
}
