import * as React from 'react';

import * as main from '../../src/main';
import { Button, css, ObjectView, renderer, value } from './common';
import { TestPanel } from './TestPanel';

export type ITestState = {
  data: any;
};

export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = { data: {} };
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public db: main.Db;
  public swarm: main.Swarm;

  public componentWillMount() {
    this.init();
  }

  private init = async () => {
    const { id } = this.context;
    const dir = `.db/db-tmp-${id}`;
    const dbKey =
      id > 1 ? 'b83a722214bdf9db4bd7a9f900144b8c80c6d7dc7f81372e4e48875cbb903e00' : undefined;

    const res = await main.init({ dir, dbKey });
    const db = (this.db = res.db);
    const swarm = (this.swarm = res.swarm);

    console.group('🌳 HyperDB');
    console.log('- dbKey:', res.dbKey);
    console.log('- localKey:', res.localKey);
    console.groupEnd();

    db.watch().watch$.subscribe(async e => {
      const version = await db.version();
      const watching = db.watching;
      this.setData({ version, watching, [e.key]: e.value });
    });
  };

  public render() {
    const styles = {
      base: css({ margin: 20 }),
      columns: css({ Flex: 'horizontal', lineHeight: 1.6 }),
      left: css({ width: 250 }),
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
                <Button label={'db.get'} onClick={this.getValue} />
              </li>
              <li>
                db.put: <Button label={'foo'} onClick={this.putValue('foo')} />
                <Button label={'bar'} onClick={this.putValue('bar')} />
              </li>
              <li>
                <Button label={'db.del'} onClick={this.deleteValue} />
              </li>
              <li>
                <Button label={'db.dispose'} onClick={this.dispose} />
              </li>
              <li>
                <Button label={'swarm.leave'} onClick={this.leaveSwarm} />
              </li>
              <li>
                <Button label={'swarm.join'} onClick={this.joinSwarm} />
              </li>
            </ul>
          </div>
          <div {...styles.right}>
            <ObjectView name={'db'} data={this.state.data} expandLevel={2} />
          </div>
        </div>
      </TestPanel>
    );
  }

  private count = 0;
  private getValue = async () => {
    const res = await this.db.get('foo');
    // console.log('get:', res);
    this.count = res.value || 0;
    this.setData({ foo: res.value });
  };
  private putValue = (key: string) => {
    return async () => {
      await this.getValue();
      this.count++;
      const res = await this.db.put(key, this.count);
      // console.log('put:', res);
      this.count = res.value || 0;
    };
  };

  private deleteValue = async () => {
    const res = await this.db.del('foo');
    // console.log('del:', res);
    this.setData({ foo: res.value });
  };

  private setData = (obj: {}) => {
    let data = { ...this.state.data };
    Object.keys(obj).forEach(key => {
      data = { ...data, [key]: obj[key] };
    });
    data = value.deleteUndefined(data);
    this.setState({ data });
  };

  private dispose = () => {
    this.db.dispose();
  };

  private joinSwarm = async () => {
    await this.swarm.join();
  };
  private leaveSwarm = async () => {
    this.swarm.leave();
  };
}
