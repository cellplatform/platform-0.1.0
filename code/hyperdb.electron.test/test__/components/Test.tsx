import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { Button, ObjectView } from '@uiharness/ui';
import * as React from 'react';

/**
 * Test Component
 */
export type IState = { count?: number };
export class Test extends React.PureComponent<{}, IState> {
  public state: IState = {};

  public render() {
    return (
      <div style={{ paddingLeft: 25 }}>
        <div style={{ marginBottom: 10 }}>
          <Button label={'Increment'} onClick={this.increment(1)} />
          <Button label={'Decrement'} onClick={this.increment(-1)} />
        </div>
        <ObjectView name={'state'} data={this.state} />
      </div>
    );
  }

  private increment = (amount: number) => {
    return () => {
      this.setState({ count: (this.state.count || 0) + amount });
    };
  };
}
