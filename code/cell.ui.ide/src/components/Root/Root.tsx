import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, onStateChanged, t, ui } from '../../common';
import { Monaco } from '../Monaco';
import { WindowTitleBar } from '../primitives';
import { Sidebar } from '../Sidebar';

const COLOR = {
  IDE_BG: '#272822',
};

export type IRootProps = { style?: CssValue };
export type IRootState = {};

export class Root extends React.PureComponent<IRootProps, IRootState> {
  public state: IRootState = {};
  private state$ = new Subject<Partial<IRootState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    ctx.event$.subscribe((e) => {
      console.log('e', e);
    });

    changes
      .on('APP:IDE/types/data', 'APP:IDE/types/clear')
      .pipe()
      .subscribe((e) => {
        this.updateTypes();
      });

    changes
      .on('APP:IDE/uri')
      .pipe()
      .subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get store() {
    return this.context.getState();
  }

  public get uri() {
    return this.store.uri;
  }

  public get isLoaded() {
    return Boolean(this.uri);
  }

  /**
   * Methods
   */

  public async updateTypes() {
    const state = this.store;
    const typesystem = state.typesystem;
    const monaco = await Monaco.api();

    if (!typesystem) {
      monaco.lib.clear();
    } else {
      const uri = state.uri || 'unknown';
      const filename = `${uri}.d.ts`;
      monaco.lib.add(filename, typesystem.ts);

      /**
       * TODO
       * - Note, these libraries are loaded as disposables
       *   which you may want to hold onto as refs to individually dispose.
       */

      // private loadedTypeLibs: t.IDisposable[] = [];

      // const addLib = async (filename: string, content: string) => {
      //   const ref = monaco.addLib(filename, content);
      //   this.loadedTypeLibs.push(ref);
      // };
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0 }),
      titlebar: css({ Absolute: [0, 0, null, 0] }),
    };

    const uri = this.uri;

    return (
      <div {...css(styles.base, this.props.style)}>
        <WindowTitleBar style={styles.titlebar} address={uri} />
        {this.renderBody()}
      </div>
    );
  }

  private renderBody() {
    const isLoaded = this.isLoaded;
    const styles = {
      base: css({
        Absolute: [WindowTitleBar.HEIGHT, 0, 0, 0],
        Flex: 'vertical-stretch-stretch',
        display: 'flex',
        overflow: 'hidden',
      }),
      body: css({
        flex: 1,
        position: 'relative',
        display: 'flex',
        Flex: 'horizontal-stretch-stretch',
      }),
      editor: css({
        flex: 1,
        position: 'relative',
      }),
      editorMask: css({
        Absolute: 0,
        backgroundColor: COLOR.IDE_BG,
        opacity: 0.9,
      }),
      sidebar: css({
        position: 'relative',
        width: 250,
        display: 'flex',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.editor}>
            <Monaco />
            {!isLoaded && <div {...styles.editorMask} />}
          </div>
          <div {...styles.sidebar}>
            <Sidebar />
          </div>
        </div>
      </div>
    );
  }
}
