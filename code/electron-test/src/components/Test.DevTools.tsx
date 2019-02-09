import * as React from 'react';

import {
  css,
  GlamorValue,
  ICreateDevToolsEvent,
  ipc,
  renderer,
} from '../common';
import { Button } from './primitives';

/**
 * Test component.
 */
export type IDevToolsTestProps = {
  style?: GlamorValue;
};

export class DevToolsTest extends React.PureComponent<IDevToolsTestProps> {
  constructor(props: IDevToolsTestProps) {
    super(props);
  }

  public render() {
    const styles = {
      base: css({ marginBottom: 50 }),
      buttons: css({
        lineHeight: '1.6em',
        Flex: 'vertical-start',
        paddingLeft: 15,
      }),
    };
    return (
      <div {...styles.base}>
        <h2>DevTools</h2>
        <div {...styles.buttons}>
          <Button label={'create'} onClick={this.newWindow} />
          <Button label={'clearConsoles'} onClick={this.clearConsoles} />
        </div>
      </div>
    );
  }

  private newWindow = () => {
    const windowId = renderer.id;
    ipc.send<ICreateDevToolsEvent>('DEVTOOLS/create', { windowId }, ipc.MAIN);
  };

  private clearConsoles = () => {
    renderer.devTools.clearConsoles();
  };
}
