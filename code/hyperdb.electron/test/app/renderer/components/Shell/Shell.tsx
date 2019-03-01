import * as React from 'react';
import { css, color, GlamorValue, renderer, t } from '../../common';
import { ShellIndex } from '../Shell.Index';
import { Test } from '../../Test';

export type IShellProps = {
  style?: GlamorValue;
};

export type IShellState = {};

export class Shell extends React.PureComponent<IShellProps, IShellState> {
  public state: IShellState = {};
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  private get store() {
    return this.context.store as t.ITestStore;
  }

  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal',
      }),
      index: css({
        position: 'relative',
        width: 180,
      }),
      main: css({
        position: 'relative',
        padding: 20,
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ShellIndex style={styles.index} onNew={this.handleNew} onConnect={this.handleConnect} />
        <div {...styles.main}>
          <Test />
        </div>
      </div>
    );
  }

  private handleNew = async () => {
    const { ipc, log } = this.context;

    // Prepare the new directory name for the database.
    const values = await this.store.read('dir', 'databases');
    const databases = values.databases || [];
    const primaryCount = databases.filter(name => name.startsWith('primary-')).length;
    const dir = `${values.dir}/primary-${primaryCount + 1}`;

    try {
      // Create the database.
      const res = await renderer.create({ ipc, dir, dbKey: undefined });
      const db = res.db;
      console.log('db', db);
      console.group('🌳 HyperDB (renderer)');
      console.log('- dbKey:', db.key);
      console.log('- localKey:', db.localKey);
      console.groupEnd();
    } catch (error) {
      log.error(error);
    }
  };

  private handleConnect = () => {
    console.log('connect');
  };
}
