import * as React from 'react';
import { Subject } from 'rxjs';

import { color, css, CssValue, t, ui } from '../../common';
import { Shell } from '../Finder.Shell';
import { WindowTitleBar } from '../primitives';

export type IRootProps = {
  ctx: t.IFinderContext;
  style?: CssValue;
};

export class Root extends React.PureComponent<IRootProps> {
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);
  }

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

    const uri = ''; // temp

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <Shell style={styles.body} />
      </div>
    );
  }
}
