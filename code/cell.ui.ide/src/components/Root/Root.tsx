import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, t, Client, ui } from '../../common';
import { WindowTitleBar, WindowFooterBar } from '../primitives';
import { Monaco } from '../Monaco';

export type IRootProps = { style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

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
    const styles = {
      base: css({ Absolute: 0 }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
    };

    const uri = '';

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        {this.renderBody()}
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        Flex: 'vertical-stretch-stretch',
        display: 'flex',
      }),
      body: css({
        flex: 1,
        position: 'relative',
        display: 'flex',
        Flex: 'horizontal-stretch-stretch',
      }),
      editor: css({
        position: 'relative',
        flex: 1,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.editor}>
            <Monaco />
          </div>
          {this.renderSidebar()}
        </div>
        <WindowFooterBar>{this.renderFooter()}</WindowFooterBar>
      </div>
    );
  }

  private renderSidebar() {
    const styles = {
      base: css({
        width: 250,
      }),
    };
    return (
      <div {...styles.base}>
        <div>Sidebar</div>
      </div>
    );
  }

  private renderFooter() {
    const styles = {
      base: css({
        PaddingX: 10,
        Flex: 'center-start',
        fontSize: 11,
        color: color.format(-0.62),
      }),
      div: css({
        marginLeft: 10,
        marginRight: 10,
        width: 0,
        height: '100%',
        borderLeft: `solid 1px ${color.format(-0.15)}`,
        borderRight: `solid 1px ${color.format(0.7)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div onClick={this.handlePullTypes}>Pull Types</div>
        <div {...styles.div} />
        <div onClick={this.handleUnloadTypes}>Unload Types</div>
      </div>
    );
  }

  /**
   * Handlers
   */

  private loadedTypeLibs: t.IDisposable[] = [];

  private handlePullTypes = async () => {
    const monaco = await Monaco.api();

    // const addLib = async (filename: string, content: string) => {
    //   const ref = monaco.addLib(filename, content);
    //   this.loadedTypeLibs.push(ref);
    // };

    //     await addLib(
    //       'facts.d.ts',
    //       `
    // declare class Facts {
    //   static next(): string;
    // }

    //     `,
    //     );

    // const { env } = this.props;
    // const http = Client.http(env.host);
    const ctx = this.context;
    const http = ctx.client.http;
    const host = ctx.client.host;

    const ns = http.ns(ctx.def);
    const info = await ns.read();
    const typeNs = info.body.data.ns.props?.type?.implements || '';

    const client = Client.typesystem(host);
    const ts = await client.typescript(typeNs, { exports: false, imports: false });

    let text = ts.toString();
    text = text.replace(/t\./g, '');

    console.log(`declaration (${typeNs})\n\n`, text);
    monaco.lib.add('tmp.d.ts', text);
  };

  private handleUnloadTypes = async () => {
    const monaco = await Monaco.api();
    // this.loadedTypeLibs.forEach(ref => ref.dispose());
    monaco.lib.clear();
  };
}
