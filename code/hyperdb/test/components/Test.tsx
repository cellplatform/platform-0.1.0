import * as React from 'react';
import { uniq } from 'ramda';

import * as main from '../../src/main';
import { Button, css, ObjectView, renderer, value, color } from './common';
import { TestPanel } from './TestPanel';

export type ITestState = {
  data: any;
  versions: string[];
};

/**
 * See
 * - https://github.com/mafintosh/hyperdb#api
 */
export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = { data: {}, versions: [] };
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
      id > 1 ? '4a1e914a33a9b2a6e4f5769f0cd73e308e33ec8cf86a804b74cda010c1aeed62' : undefined;

    const res = await main.init({ dir, dbKey });
    const db = (this.db = res.db);
    const swarm = (this.swarm = res.swarm);

    console.group('🌳 HyperDB');
    console.log('- dbKey:', res.dbKey);
    console.log('- localKey:', res.localKey);
    console.groupEnd();

    db.watch().watch$.subscribe(async e => {
      this.appendVersion(e.version);
      this.setPropData(e.key, e.value);
    });

    swarm.events$.subscribe(e => this.updateData(db));
    this.updateData(db);
    this.appendVersion(await db.version());
  };

  private updateData = async (db: main.Db) => {
    const swarm = this.swarm;
    const version = await db.version();
    this.setData({
      db: {
        dbKey: db.buffer.key.toString('hex'),
        localKey: db.buffer.localKey.toString('hex'),
        version,
        watching: db.watching,
      },
      swarm: {
        id: swarm.id,
        isActive: swarm.isActive,
        connections: await swarm.connections(),
      },
    });
    this.getValue(db);
  };

  private appendVersion = (version: string) => {
    const versions = uniq([version, ...this.state.versions]);
    this.setState({ versions });
  };

  public render() {
    const styles = {
      base: css({ margin: 20, boxSizing: 'border-box', fontSize: 14 }),
      hr: css({ border: 'none', borderTop: `solid 1px ${color.format(-0.2)}` }),
      ul: css({ margin: 0, padding: 0, listStyle: 'none' }),
      columns: css({
        Flex: 'horizontal-stretch-stretch',
        lineHeight: 1.6,
      }),
      left: css({ width: 150, paddingRight: 20 }),
      middle: css({
        width: 250,
        position: 'relative',
      }),
      right: css({ flex: 1, paddingLeft: 20 }),
    };

    return (
      <TestPanel title={'hyperdb'} style={styles.base}>
        <div {...styles.columns}>
          <div {...styles.left}>
            <ul {...styles.ul}>
              {this.button('db.get', this.getValue)}
              {this.button('db.put(foo)', this.putValue('foo'))}
              {this.button('db.put(bar)', this.putValue('bar'))}
              {this.button('db.del', this.deleteValue)}
              {this.button('db.dispose', this.dispose)}
              <hr {...styles.hr} />
              {this.button('swarm.leave', this.leaveSwarm)}
              {this.button('swarm.join', this.joinSwarm)}
            </ul>
          </div>
          <div {...styles.middle}>{this.renderVersions()}</div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={this.state.data} expandPaths={['$.values']} />
          </div>
        </div>
      </TestPanel>
    );
  }

  private renderVersions() {
    const { versions = [] } = this.state;
    if (versions.length === 0) {
      return null;
    }
    const styles = {
      base: css({
        Absolute: 0,
        position: 'relative',
        Flex: 'vertical',
      }),
      list: css({ Scroll: true, flex: 1, fontSize: 13 }),
      ul: css({ margin: 0, padding: 0, paddingLeft: 20 }),
      li: css({
        fontFamily: 'monospace',
        fontWeight: 'bold',
      }),
    };

    const elVersions = versions.map((version, i) => {
      const start = version.substr(0, 4);
      const end = version.substr(version.length - 10);
      const short = `${start}…${end}`;
      const latest = i === 0 ? ' (latest)' : '';
      return (
        <li key={i} {...styles.li}>
          <Button onClick={this.versionClick(i)}>
            {short}
            {latest}
          </Button>
        </li>
      );
    });

    return (
      <div {...styles.base}>
        <div>versions:</div>
        <div {...styles.list}>
          <ul {...styles.ul}>{elVersions}</ul>
        </div>
      </div>
    );
  }

  private button(label: string, handler: () => void) {
    return (
      <li>
        <Button label={label} onClick={handler} />
      </li>
    );
  }

  private count = 0;
  private getValue = async (db?: main.Db) => {
    db = db || this.db;
    const res = await db.get('foo');
    this.count = res.value || 0;
    this.setPropData('foo', res.value);
  };

  private putValue = (key: string) => {
    return async () => {
      await this.getValue();
      this.count++;
      const res = await this.db.put(key, this.count);
      this.count = res.value || 0;
    };
  };

  private deleteValue = async () => {
    const res = await this.db.del('foo');
    this.setPropData('foo', res.value);
  };

  private setPropData = (key: string | number | symbol, value: any) => {
    if (key) {
      const values = { ...(this.state.data.values || {}), [key]: value };
      this.setData({ values });
    }
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

  private versionClick = (index: number) => {
    return async () => {
      const version = this.state.versions[index];
      const db = this.db.checkout(version);
      this.updateData(db);
    };
  };
}
