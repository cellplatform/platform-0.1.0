import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, share } from 'rxjs/operators';

import { Client, css, CssValue, t, ui } from '../../common';
import { WindowTitleBar } from '../primitives';
import { TreeShell } from '../Finder.TreeShell';
// import { Viewer } from '../Viewer';
import { Doc } from '../Viewer.Doc';

import * as tmp from '../../_tmp';

export type IRootProps = {
  uri: string;
  env: t.IEnv;
  event$?: Subject<t.FinderEvent>;
  style?: CssValue;
};
export type IRootState = {
  view?: React.ReactNode;
};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();
  private event$ = this.props.event$ || new Subject<t.FinderEvent>();
  private tree$ = new Subject<t.TreeViewEvent>();
  private Provider!: React.FunctionComponent;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);

    // Setup the environment context.
    const event$ = this.event$.pipe(takeUntil(this.unmounted$), share());
    const env = { ...props.env, event$ } as t.IEnv<t.FinderEvent>;
    const client = Client.typesystem(env.host);
    const dispatch = this.dispatch;
    const ctx: t.IEnvContext<t.FinderEvent> = { env, client, dispatch };

    // Initialize the context <Provider>.
    this.Provider = ui.createProvider({ ctx });
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const tree = TreeShell.events(this.tree$.pipe(takeUntil(this.unmounted$)));

    /**
     * TODO 🐷
     * - Move to somewhere else.
     */

    const left = tree.mouse({ button: 'LEFT' });
    left.click.node$.subscribe((e) => {
      // left.click.
      this.dispatchRenderView({ node: e.id });
      console.log('e.id', e.id);
    });

    // Initialize.
    this.dispatchRenderView({});
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  private dispatch = (e: t.FinderEvent) => this.event$.next(e);

  public dispatchRenderView(args: { node?: string }) {
    const { node } = args;

    const payload: t.IFinderRenderView = {
      node,
      render: (view: React.ReactNode) => this.state$.next({ view }),
    };

    this.dispatch({
      type: 'FINDER/render/view',
      payload,
    });
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

    // const elBody = <Doc style={{ Absolute: 0 }} />;

    return (
      <this.Provider>
        <div {...css(styles.base, this.props.style)}>
          <WindowTitleBar style={styles.titlebar} address={uri} />
          <TreeShell
            style={styles.body}
            tree={{ root: tmp.SIMPLE }}
            tree$={this.tree$}
            body={this.state.view}
          />
          {/* <Viewer style={styles.body} uri={uri} /> */}
        </div>
      </this.Provider>
    );
  }
}
