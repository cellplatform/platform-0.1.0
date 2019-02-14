import * as React from 'react';

import { css, GlamorValue, renderer } from '../../common';
import { Button, ObjectView } from '../primitives';
import * as t from '../../types';

/**
 * Test component.
 */
export type IWindowsTestProps = {
  style?: GlamorValue;
};

export type IWindowsTestState = {};

export class WindowsTest extends React.PureComponent<
  IWindowsTestProps,
  IWindowsTestState
> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public state: IWindowsTestState = {};

  public render() {
    const styles = {
      base: css({ marginBottom: 50 }),
      columns: css({
        Flex: 'horizontal-start-spaceBetween',
      }),
      colButtons: css({
        lineHeight: '1.6em',
        Flex: 'vertical-start',
        paddingLeft: 15,
        flex: 1,
      }),
      colObject: css({
        flex: 1,
      }),
    };

    const windows = this.context.windows;
    console.log('windows', windows);

    // console.log("renderer.windows", renderer.windows)
    // renderer.

    return (
      <div {...styles.base}>
        <h2>Windows</h2>
        <div {...styles.columns}>
          <div {...styles.colButtons}>
            <Button label={'new window'} onClick={this.newWindow} />
          </div>
          <div {...styles.colObject}>
            <ObjectView name={'env'} data={renderer.is.toObject()} />
          </div>
        </div>
      </div>
    );
  }

  private newWindow = () => {
    const { ipc } = this.context;
    ipc.send<t.INewWindowEvent>('NEW_WINDOW', {}, { target: ipc.MAIN });
  };
}
