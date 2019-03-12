import * as React from 'react';

/**
 * Placeholder.
 *
 */
export type IState = { count?: number };
export class Test extends React.PureComponent<{}, IState> {
  public state: IState = { count: 0 };

  public render() {
    return (
      <div style={{ paddingLeft: 25 }}>
        <h1>👋 Placeholder</h1>
      </div>
    );
  }
}
