import * as React from 'react';

// import { HyperDb } from '../../src/db';
import * as main from '../../src/main';
import { Button, css, ObjectView, renderer } from './common';
import { TestPanel } from './TestPanel';
import { async } from 'q';

export type ITestState = { count?: number };

export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = { count: 0 };
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public db: main.HyperDb;

  public componentWillMount() {
    // TEMP 🐷
    this.init();
  }

  private init = async () => {
    const { id } = this.context;
    const dir = `.db/db-tmp-${id}`;
    const dbKey =
      id > 1 ? 'b83a722214bdf9db4bd7a9f900144b8c80c6d7dc7f81372e4e48875cbb903e00' : undefined;

    const res = await main.init({ dir, dbKey });
    this.db = res.db;

    console.group('🌳 HyperDB');
    console.log('- dbKey:', res.dbKey);
    console.log('- localKey:', res.localKey);
    console.groupEnd();
  };

  public render() {
    const styles = {
      base: css({ margin: 20 }),
      columns: css({ Flex: 'horizontal', lineHeight: 1.6 }),
      left: css({ flex: 1 }),
      right: css({ flex: 1 }),
    };

    return (
      <TestPanel title={'hyperdb'} style={styles.base}>
        <div {...styles.columns}>
          <div {...styles.left}>
            <ul>
              <li>
                <Button label={'init'} onClick={this.init} />
              </li>
              <li>
                <Button label={'get'} onClick={this.getValue} />
              </li>
              <li>
                <Button label={'put'} onClick={this.putValue} />
              </li>
              <li>
                <Button label={'del'} onClick={this.deleteValue} />
              </li>
            </ul>
          </div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={this.state} />
          </div>
        </div>
      </TestPanel>
    );
  }

  private count = 0;
  private getValue = async () => {
    const res = await this.db.get('foo');
    console.log('get:', res);
    this.count = res.value || 0;
  };
  private putValue = async () => {
    this.count++;
    const res = await this.db.put('foo', this.count);
    console.log('put:', res);
    this.count = res.value || 0;
  };

  private deleteValue = async () => {
    const res = await this.db.del('foo');
    console.log('del:', res);
  };
}
