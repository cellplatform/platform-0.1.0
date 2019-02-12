import * as React from 'react';

import { css, GlamorValue, renderer } from '../common';
import { IpcTest } from './Test.Ipc';
import { DevToolsTest } from './Test.DevTools';
import { StoreTest } from './Test.Store';

renderer.init();

export type ITestProps = {
  style?: GlamorValue;
};

export class Test extends React.PureComponent<ITestProps> {
  public render() {
    const styles = {
      base: css({
        paddingTop: 5,
        PaddingX: 25,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <DevToolsTest />
        <IpcTest />
        <StoreTest />
      </div>
    );
  }
}
