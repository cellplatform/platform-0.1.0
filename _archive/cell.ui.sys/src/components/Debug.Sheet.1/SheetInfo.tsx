import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue } from '../../common';
import { Card, ObjectView, PropList, Treeview } from '../primitives';
import * as t from './types';

export type ISheetInfoProps = {
  store: t.IDebugSheetWrite;
  style?: CssValue;
};

export class SheetInfo extends React.PureComponent<ISheetInfoProps> {
  private unmounted$ = new Subject<void>();
  private tree = Treeview.State.create({ root: { id: 'sheet', props: { label: 'Info' } } });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.store.event.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    // TEMP 🐷
    this.tree.add({ root: 'foo' });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get store() {
    return this.props.store;
  }

  public get sheet() {
    return this.store.state.sheet;
  }

  /**
   * [Render]
   */

  public render() {
    const sheet = this.sheet;
    if (!sheet) {
      return null;
    }

    const styles = {
      base: css({ Flex: 'horizontal-stretch-stretch' }),
      left: css({ flex: 1 }),
      right: css({ flex: 1 }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          {this.renderTree()}

          {this.renderObject({ data: sheet })}
        </div>
        <div {...styles.right}>{this.renderTypes()}</div>
      </div>
    );
  }

  private renderTree() {
    // TEMP 🐷
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        width: 250,
        height: 250,
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        <Treeview root={this.tree.state} background={'NONE'} />
      </div>
    );
  }

  private renderObject(props: { name?: string; data: t.Object }) {
    const data = { ...props.data };
    Object.keys(data)
      .filter((key) => key.startsWith('_') || key.endsWith('$'))
      .forEach((key) => delete data[key]);
    return <ObjectView name={props.name} data={data} />;
  }

  private renderTypes() {
    const sheet = this.sheet;
    if (!sheet) {
      return null;
    }

    const styles = {
      base: css({
        display: 'flex',
      }),
    };
    const uri = sheet.uri.toString();

    const elTypes = sheet.types.map(({ typename, columns }) => {
      return this.renderType({ uri, typename, columns });
    });

    return <div {...styles.base}>{elTypes}</div>;
  }

  private renderType(props: { uri: string; typename: string; columns: t.IColumnTypeDef[] }) {
    const { uri, typename } = props;
    const styles = {
      card: css({
        flex: 1,
        PaddingY: 15,
        PaddingX: 20,
      }),
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

    const columns = props.columns.map((item) => {
      const label = (
        <div {...styles.label}>
          <div {...styles.column}>{item.column}</div>
          <div>{item.prop}</div>
        </div>
      );
      const value = item.type.typename;
      const tooltip = item.default ? item.default.toString() : undefined;
      const clipboard = JSON.stringify(item.type, null, '  ');
      const res: t.IPropListItem = { label, value, tooltip, clipboard };
      return res;
    });

    const title = `Type`;
    const items = [
      { label: 'typename', value: typename },
      { label: 'def', value: uri },
      ...columns,
    ];
    return (
      <Card key={typename} style={styles.card}>
        <PropList title={title} items={items} />
      </Card>
    );
  }
}
