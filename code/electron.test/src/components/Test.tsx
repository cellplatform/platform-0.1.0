import * as React from 'react';

import { css, CssValue, renderer } from '../common';
import { IpcTest } from './Test/Ipc';
import { DevToolsTest } from './Test/DevTools';
import { SettingsTest } from './Test/Settings';
import { WindowsTest } from './Test/Windows';

export type ITestProps = {
  style?: CssValue;
};

export class Test extends React.PureComponent<ITestProps> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public render() {
    const styles = {
      base: css({
        paddingTop: 5,
        PaddingX: 25,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowsTest />
        <DevToolsTest />
        <IpcTest />
        <SettingsTest />
      </div>
    );
  }
}
