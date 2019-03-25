import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as React from 'react';
import { GraphqlEditor } from '../../src';
import { color, css } from './common';

/**
 * Test Component
 */
export type IState = { count?: number };
export class Test extends React.PureComponent<{}, IState> {
  public state: IState = {};

  public render() {
    const styles = {
      base: css({
        Absolute: 20,
        display: 'flex',
        border: `solid 1px ${color.format(-0.2)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <GraphqlEditor />
      </div>
    );
  }

  private increment = (amount: number) => {
    return () => {
      this.setState({ count: (this.state.count || 0) + amount });
    };
  };
}
