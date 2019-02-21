import * as React from 'react';
import { distinctUntilChanged } from 'rxjs/operators';

import * as tmp from '../../src/_tmp';
import main from '../../src/main';
import { Button, css, ObjectView, R, renderer } from './common';
import { TestPanel } from './TestPanel';

export type ITestState = { count?: number };

export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = { count: 0 };
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public componentDidMount() {
    // TEMP 🐷
    this.init();
    // this.init__TMP();
  }

  // private init__TMP = async () => {
  //   const { id } = this.context;
  //   const db = `.db/db-${id}`;
  //   const key =
  //     id > 1 ? 'bee2b859d4b7727b82f4f336b64b6d968f1fdccf4fa376d5630c0d1c8d46a0f9' : undefined;

  //   console.log('db', db);
  //   console.log('key', key);

  //   tmp.init({ db, key });
  // };

  private init = async () => {
    const { id } = this.context;
    const db = `.db/db-${id}`;

    const publicKey = 'bee2b859d4b7727b82f4f336b64b6d968f1fdccf4fa376d5630c0d1c8d46a0f9';
    const res = await main.init({ dir: db, publicKey });
    console.group('🌳 hyperdb');
    console.log(' - dir:', res.dir);
    console.log(' - publicKey:', res.publicKey);
    console.log(' - db:', res.db);
    console.log(' - swarm:', res.swarm);
    console.groupEnd();

    // res.swarm.events$
    //   .pipe(distinctUntilChanged((prev, next) => R.equals(prev, next)))
    //   .subscribe(e => {
    //     console.log('e', e);
    //   });
  };

  public render() {
    const styles = {
      base: css({ margin: 20 }),
      columns: css({ Flex: 'horizontal' }),
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
            </ul>
          </div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={this.state} />
          </div>
        </div>
      </TestPanel>
    );
  }
}
