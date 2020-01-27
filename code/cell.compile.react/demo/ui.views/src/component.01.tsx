import { css } from '@platform/react';
import { Spinner } from '@platform/ui.spinner';
import * as React from 'react';

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
        <Spinner size={32} color={1} />
        <div id={'STATUS'}>Loading</div>
      </div>
    );
  }
}
