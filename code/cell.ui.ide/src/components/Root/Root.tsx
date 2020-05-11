import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { time, css, color, CssValue, t, Client } from '../../common';
import { WindowTitleBar, WindowFooterBar } from '../primitives';
import { Monaco } from '../Monaco';

export type IRootProps = { uri: string; env: t.IEnv; style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject<{}>();

  private monaco!: Monaco;
  private monacoRef = (ref: Monaco) => (this.monaco = ref);

  /**
   * [Lifecycle]
   */
  constructor(props: IRootProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { uri, env } = this.props;
    const styles = {
      base: css({
        Absolute: 0,
        overflow: 'hidden',
      }),
      titlebar: css({
        Absolute: [0, 0, null, 0],
      }),
      body: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        display: 'flex',
        Flex: 'vertical-strecth-stretch',
      }),
      editor: css({
        position: 'relative',
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        <div {...styles.body}>
          <div {...styles.editor}>
            <Monaco ref={this.monacoRef} />
          </div>
          <WindowFooterBar>{this.renderFooter()}</WindowFooterBar>
        </div>
      </div>
    );
  }

  private renderFooter() {
    const styles = {
      base: css({
        PaddingX: 10,
        Flex: 'center-start',
      }),
    };
    return (
      <div {...styles.base}>
        <div onClick={this.onClick}>Click</div>
      </div>
    );
  }

  /**
   * Handlers
   */
  private onClick = () => {
    console.log('hello');
    const monaco = this.monaco;

    // const typescript = monaco.languages.typescript;
    // const defaults = typescript.typescriptDefaults;

    // const addLib = (filename: string, text: string) => {
    //   return defaults.addExtraLib(text, `ts:filename/${filename}`);
    // };

    const SAMPLE = `
        declare class Facts {
          static next(): string;
        }
    `;
    const res = this.monaco.addLib('fact.d.ts', SAMPLE);

    time.delay(1200, () => {
      // res.dispose();
    });

    const { env } = this.props;

    const http = Client.http(env.host);

    console.log('env', env);

    const ns = http.ns(env.def);

    console.log('ns', ns);

    // console.log('m', m);
  };
}
