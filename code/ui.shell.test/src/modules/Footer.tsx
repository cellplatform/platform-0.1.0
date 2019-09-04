import * as React from 'react';
import { is, color, css, t, shell } from '../common';

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  const footer = shell.state.footer;
  footer.el = <Footer />;
};

export class Footer extends React.PureComponent {
  public static contextType = shell.Context;
  public context!: t.IShellContext;

  /**
   * [Render]
   */
  public render() {
    const version = attr('html', 'data-version') || '0.0.0';

    const styles = {
      base: css({
        Absolute: 0,
        fontSize: 12,
        opacity: 0.6,
        Flex: 'horizontal-center-spaceBetween',
        PaddingX: 8,
      }),
    };
    return (
      <div {...styles.base}>
        <div>
          <div>Version {version}</div>
        </div>
        <div>My Status</div>
      </div>
    );
  }
}

/**
 * Heloers
 */

const attr = (tag: string, key: string) => {
  return is.browser ? document.getElementsByTagName(tag)[0].getAttribute(key) : '';
};
