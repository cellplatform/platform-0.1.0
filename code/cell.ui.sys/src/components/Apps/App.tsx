import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t } from '../../common';
import { Card, IPropListItem, PropList } from '../primitives';

export type IAppProps = {
  env: t.IEnv;
  app: IAppData;
  style?: CssValue;
  onClick?: AppClickEventHandler;
};

export type IAppData = {
  uri: string;
  typename: string;
  props: t.App;
  types: t.ITypedSheetRowType[];
  windows: t.ITypedSheetData<t.AppWindow>;
};

export type AppClickEvent = { app: IAppData };
export type AppClickEventHandler = (e: AppClickEvent) => void;

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
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get app() {
    return this.props.app;
  }

  public get name() {
    let name = this.app.props.name;
    name = name.includes('/') ? name.split('/')[1] : name;
    return name;
  }

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

    return (
      <div {...css(styles.base, this.props.style)} onClick={this.onClick}>
        <Card style={styles.card}>
          <div>
            <div {...styles.title}>
              <div>module</div>
              <div>{this.name}</div>
            </div>
            <div {...styles.body}>{this.renderWindows()}</div>
          </div>
        </Card>
      </div>
    );
  }

  private renderWindows() {
    const { windows } = this.app;
    if (!windows) {
      return null;
    }
    const styles = {
      base: css({}),
    };

    const elList = windows.rows.map((row, i) => {
      const { x, y, width, height, isVisible } = row.props;
      const position = x === undefined || y === undefined ? '-' : `${x} x ${y}`;
      const size = width === undefined || height === undefined ? '-' : `${width} x ${height}`;
      const items: IPropListItem[] = [
        { label: 'typename', value: row.typename },
        { label: 'uri', value: row.uri.toString() },
        { label: 'position', value: position },
        { label: 'size', value: size },
        { label: 'visible', value: isVisible },
      ];
      return <PropList key={i} items={items} />;
    });

    return <div {...styles.base}>{elList}</div>;
  }

  /**
   * [Handlers]
   */
  private onClick = () => {
    const { onClick } = this.props;
    if (onClick) {
      const app = this.app;
      onClick({ app });
    }
  };
}
