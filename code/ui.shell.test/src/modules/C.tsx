import * as React from 'react';
import { COLORS, css, t } from '../common';

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  const { body, sidepanel } = shell.state;
  body.el = <ComponentC />;
  sidepanel.el = undefined;
  sidepanel.background = COLORS.DARK;
};

export class ComponentC extends React.PureComponent {
  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...styles.base}>
        <div>ComponentC</div>
      </div>
    );
  }
}
