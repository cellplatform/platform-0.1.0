import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Client, css, CssValue, t, ui } from '../../common';
import { WindowTitleBar } from '../primitives';
import { TreeShell } from '../TreeShell';
// import { Viewer } from '../Viewer';

import * as tmp from '../../_tmp';

export type IRootProps = { uri: string; env: t.IEnv; style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();
  private Provider!: React.FunctionComponent;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);

    // Initialize the context <Provider>
    const { env } = props;
    const client = Client.typesystem(env.host);
    const ctx: t.IEnvContext = { env, client };
    this.Provider = ui.createProvider({ ctx });
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { uri } = this.props;
    const styles = {
      base: css({ Absolute: 0 }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
      body: css({ Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0] }),
    };

    return (
      <this.Provider>
        <div {...css(styles.base, this.props.style)}>
          <WindowTitleBar style={styles.titlebar} address={uri} />
          <TreeShell style={styles.body} tree={{ root: tmp.SIMPLE }} />
          {/* <Viewer style={styles.body} uri={uri} /> */}
        </div>
      </this.Provider>
    );
  }
}
