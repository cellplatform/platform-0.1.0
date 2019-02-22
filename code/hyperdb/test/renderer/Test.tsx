// tslint:disable

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import main from '../../src/main';
import renderer from '../../src/renderer';
import { Button, color, css, ObjectView, R, value } from './common';
import { TestPanel } from './TestPanel';

export type ITestState = {
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
  public db: renderer.IDb;
  // public swarm: renderer.ISwarm;

  public async componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e as ITestState));

    // this.db = await  this.init();
    this.db = await this.initRendererDb();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  private init = async () => {
    const { id, ipc } = this.context;
    const dir = `.db/tmp-${id}`;
    const dbKey =
      id > 1 ? '937c453128fbd651deb0ed4d7b738ed374759beb8a11cdd08e150d47c7f77d8b' : undefined;

    const res = await main.create({ dir, dbKey });
    const db = res.db;
    // const swarm = (this.swarm = res.swarm);

    // const dbr = await renderer.create({ ipc, dir: `.db/r-${id}`, dbKey });
    console.group('🌳 HyperDB (main)');
    console.log('- dbKey:', db.key);
    console.log('- localKey:', db.localKey);
    console.groupEnd();

    await db.watch('*');
    db.watch$.subscribe(async e => {
      this.appendVersion(e.version);
      this.setPropData(e.key, e.value);
    });

    // swarm.events$.subscribe(e => this.updateData(db));

    this.updateData(db);
    this.appendVersion(await db.version());
    return db;
  };

  private initRendererDb = async () => {
    const { id, ipc } = this.context;
    const dir = `.db/r-${id}`;
    const dbKey =
      id > 1 ? 'f6ea25790b275575f6e91c62c39d8d7945f73ee92a6d83ea50356b7e245b9ab0' : undefined;

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

    // db.watch$.subscribe(async e => {
    //   this.appendVersion(e.version);
    //   this.setPropData(e.key, e.value);
    // });

    // swarm.events$.subscribe(e => this.updateData(db));

    this.updateData(db);
    this.appendVersion(await db.version());
    return db;
  };

  private updateData = async (db: renderer.IDb) => {
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
              {this.button('read all', this.getValues)}
              {this.button(`db.put: ${KEY.A1}`, this.putValue(KEY.A1))}
              {this.button(`db.put: ${KEY.A2}`, this.putValue(KEY.A2))}
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
    return async (db?: renderer.IDb) => {
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
    // await this.swarm.join();
  };
  private leaveSwarm = async () => {
    // this.swarm.leave();
  };

  private versionClick = (index: number) => {
    return async () => {
      const version = this.state.versions[index];
      const db = await this.db.checkout(version);
      await this.updateData(db);
    };
  };
}
