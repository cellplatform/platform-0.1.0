// tslint:disable

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import renderer from '../../src/renderer';
import { Button, color, css, ObjectView, R, value } from './common';
import { TestPanel } from './TestPanel';

type IRendererDb = renderer.IRendererDb;
export type ITestState = {
  dbKey?: string;
  data: any;
  versions: string[];
};

const KEY = {
  A1: 'A1',
  A2: 'A2',
};

/**
 * See
 * - https://github.com/mafintosh/hyperdb#api
 */
export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = { data: {}, versions: [] };
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  public db: IRendererDb;
  // public swarm: renderer.ISwarm;

  public async componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e as ITestState));
    this.db = await this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  private init = async () => {
    const { id, ipc } = this.context;
    const dir = `.db/tmp-${id}`;
    // const dbKey =
    //   id > 1 ? 'ec2863f47c01711fde7505ff430cd8121ef1d8aaf5a0b329a65ef1f0d6cfa1fe' : undefined;
    const dbKey = 'ec2863f47c01711fde7505ff430cd8121ef1d8aaf5a0b329a65ef1f0d6cfa1fe';

    const res = await renderer.create({ ipc, dir, dbKey });
    const db = res.db;
    // this.db = db;
    // const swarm = (this.swarm = res.swarm);

    // const dbr = await renderer.create({ ipc, dir: `.db/r-${id}`, dbKey });
    console.group('🌳 HyperDB (renderer)');
    console.log('- dbKey:', db.key);
    console.log('- localKey:', db.localKey);
    console.groupEnd();

    await db.watch('*');
    await db.put('foo', 123);

    const foo = await db.get('foo');
    console.log('foo', foo);

    db.watch$.subscribe(async e => {
      this.appendVersion(e.version);
      this.setPropData(e.key, e.value);
    });

    // swarm.events$.subscribe(e => this.updateData(db));

    this.updateData(db);
    this.appendVersion(await db.version());
    this.state$.next({ dbKey: db.key });
    return db;
  };

  private updateData = async (db: IRendererDb) => {
    // const swarm = this.swarm;
    const version = await db.version();
    this.setData({
      db: {
        dbKey: db.key,
        localKey: db.localKey,
        watching: db.watching,
        version,
      },
      // swarm: {
      //   id: swarm.id,
      //   isActive: swarm.isActive,
      //   connections: await swarm.connections(),
      // },
    });
    this.getValue(KEY.A1)(db);
    this.getValue(KEY.A2)(db);
  };

  private appendVersion = (version: string) => {
    const versions = R.uniq([version, ...this.state.versions]).filter(v => Boolean(v));
    this.state$.next({ versions });
  };

  public render() {
    const MARGIN = 20;
    const styles = {
      base: css({
        boxSizing: 'border-box',
        fontSize: 14,
        Absolute: [4, 3, MARGIN, MARGIN],
        margin: 0,
      }),
      hr: css({ border: 'none', borderTop: `solid 1px ${color.format(-0.2)}` }),
      ul: css({ margin: 0, padding: 0, listStyle: 'none' }),
      columns: css({
        Flex: 'horizontal-stretch-stretch',
        lineHeight: 1.6,
        borderTop: `solid 5px ${color.format(-0.1)}`,
        marginTop: 15,
        paddingTop: 15,
      }),
      left: css({ width: 150, paddingRight: 20 }),
      middle: css({
        width: 250,
        position: 'relative',
      }),
      right: css({ flex: 1, paddingLeft: 20 }),
    };

    return (
      <TestPanel title={'Hypersheet Database'} style={styles.base}>
        {this.renderDbKey()}
        <div {...styles.columns}>
          <div {...styles.left}>
            <ul {...styles.ul}>
              {this.button('read all', this.getValues)}
              {this.button(`db.put: ${KEY.A1}`, this.putValue(KEY.A1))}
              {this.button(`db.put: ${KEY.A2}`, this.putValue(KEY.A2))}
              {this.button('db.del', this.deleteValue)}
              {this.button('db.dispose', this.dispose)}
              <hr {...styles.hr} />
              swarm
              {this.button('disconnect', this.leaveSwarm)}
              {this.button('connect', this.joinSwarm)}
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

  private renderDbKey() {
    const { dbKey } = this.state;
    if (!dbKey) {
      return;
    }
    const styles = {
      base: css({
        Absolute: [-30, 20, null, null],
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 12,
        Flex: 'horizontal',
      }),
      label: css({
        color: color.format(-0.3),
        marginRight: 8,
      }),
      key: css({
        color: '#881391', // Purple.
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.label}>database key:</div> <div {...styles.key}>{dbKey}</div>
      </div>
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
      li: css({ fontFamily: 'monospace', fontWeight: 'bold' }),
    };

    const elVersions = versions.map((version, i) => {
      const start = version.substr(0, 4);
      const end = version.substr(version.length - 10);
      const short = `${start}..${end}`;
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

  private getValues = () => {
    Object.keys(KEY).forEach(key => this.getValue(key)(this.db));
  };

  private getValue = (key: string) => {
    return async (db?: IRendererDb) => {
      db = db || this.db;
      const res = await db.get(key);
      const value = res.value || 0;
      console.log('GET', key, res);
      this.setPropData(key, value);
      return value;
    };
  };

  private putValue = (key: string) => {
    return async () => {
      const count = (await this.getValue(key)()) + 1;
      await this.db.put(key, count);
    };
  };

  private deleteValue = async () => {
    const key = KEY.A1;

    await this.db.del(KEY.A1);
    await this.db.del(KEY.A2);

    const res = await this.db.del(key);
    this.setPropData(key, res.value);
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
    this.state$.next({ data });
  };

  private dispose = () => {
    this.db.dispose();
  };

  private joinSwarm = async () => {
    await this.db.connect();
  };
  private leaveSwarm = async () => {
    await this.db.disconnect();
  };

  private versionClick = (index: number) => {
    return async () => {
      const version = this.state.versions[index];
      const db = await this.db.checkout(version);
      await this.updateData(db as IRendererDb);
    };
  };
}
