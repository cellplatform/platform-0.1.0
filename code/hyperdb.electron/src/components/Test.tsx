import * as React from 'react';
import { Button, ObjectView } from '@uiharness/electron/lib/components';

/**
 * Sample component.
 *
 * Referred to by the [renderer] and [web] entry-point, see:
 *
 *    - [.uiharness.yml]
 *    - [test/renderer.tsx]
 *    - [test/web.tsx]
 *
 */
export type IState = { count?: number };
export class Test extends React.PureComponent<{}, IState> {
  public state: IState = { count: 0 };

  public render() {
    return (
      <div style={{ paddingLeft: 25 }}>
        <h1>Hello World!</h1>
        <ul>
          <li>
            <Button label={'Increment'} onClick={this.increment(1)} />
          </li>
          <li>
            <Button label={'Decrement'} onClick={this.increment(-1)} />
          </li>
        </ul>
        <ObjectView name={'state'} data={this.state} />
      </div>
    );
  }

  private increment = (by: number) => {
    return () => {
      const count = (this.state.count || 0) + by;
      this.setState({ count });
    };
  };
}
