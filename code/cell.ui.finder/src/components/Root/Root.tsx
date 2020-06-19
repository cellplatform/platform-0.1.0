import * as React from 'react';
import { Subject } from 'rxjs';

import { color, css, CssValue, t, ui } from '../../common';
import { FinderShell } from '../FinderShell';
import { WindowTitleBar } from '../primitives';

export type IRootProps = { style?: CssValue };

export class Root extends React.PureComponent<IRootProps> {
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: color.format(1),
      }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
      body: css({ Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0] }),
    };

    const uri = 'system.finder'; // temp

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <FinderShell style={styles.body} leftWidth={200} />
      </div>
    );
  }
}
