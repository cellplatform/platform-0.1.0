import { css } from '@platform/react';
import * as React from 'react';
import { Spinner } from '@platform/ui.spinner';

export type IFooProps = {};
export type IFooState = {};

export class Foo extends React.PureComponent<IFooProps, IFooState> {
  public state: IFooState = {};

  /**
   * [Lifecycle]
   */
  constructor(props: IFooProps) {
    super(props);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.8)' /* RED */,
        color: 'white',
        fontSize: 45,
        padding: 20,
      }),
    };
    return (
      <div {...styles.base}>
        <div>Foo</div>
        <Spinner />
      </div>
    );
  }
}
