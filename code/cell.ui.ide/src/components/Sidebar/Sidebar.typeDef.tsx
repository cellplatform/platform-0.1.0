import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, t } from '../../common';
import { IPropListItem, PropList } from '../primitives';

export type ISidebarTypeDefProps = { typeDef: t.INsTypeDef; style?: CssValue };
export type ISidebarTypeDefState = t.Object;

export class SidebarTypeDef extends React.PureComponent<
  ISidebarTypeDefProps,
  ISidebarTypeDefState
> {
  public state: ISidebarTypeDefState = {};
  private state$ = new Subject<Partial<ISidebarTypeDefState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
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
    const { typeDef } = this.props;
    const styles = {
      label: css({
        Flex: 'horizontal-center-center',
      }),
      column: css({
        backgroundColor: COLORS.DARK,
        color: color.format(1),
        PaddingX: 5,
        paddingTop: 1,
        paddingBottom: 1,
        marginRight: 6,
        borderRadius: 2,
        fontSize: 10,
        minWidth: 24,
        textAlign: 'center',
        boxSizing: 'border-box',
      }),
    };

    const columns = typeDef.columns.map((item) => {
      const label = (
        <div {...styles.label}>
          <div {...styles.column}>{item.column}</div>
          <div>{item.prop}</div>
        </div>
      );
      const value = item.type.typename;
      const tooltip = item.default ? item.default.toString() : undefined;
      const clipboard = JSON.stringify(item.type, null, '  ');
      const res: IPropListItem = { label, value, tooltip, clipboard };
      return res;
    });

    const title = `Type`;
    const items = [
      { label: 'typename', value: typeDef.typename },
      { label: 'uri', value: typeDef.uri },
      ...columns,
    ];
    return <PropList title={title} items={items} />;
  }
}
