import * as React from 'react';
import { Button, ObjectView, css, renderer } from './common';
import { TestPanel } from './TestPanel';
import main from '../../src/main';

export type ITestState = { count?: number };

export class Test extends React.PureComponent<{}, ITestState> {
  public state: ITestState = { count: 0 };
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public componentDidMount() {
    // TEMP 🐷
    this.init();
  }
  private init = async () => {
    // const { log } = this.context;
    const res = await main.init({ storage: '.db/db1' });
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
