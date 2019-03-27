import { CommandPrompt } from '@platform/ui.cli';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { init as initCommandLine } from '../cli';
import { color, COLORS, css, t } from '../common';
import { TestText } from './Test.Text';
import { TestTextInput } from './Test.TextInput';

const KEY = {
  VIEW: 'ui.text/view',
};

function fromStorage<T = any>(key: string, defaultValue?: T): T | undefined {
  const value = localStorage.getItem(key);
  return (value === undefined ? defaultValue : value) as T;
}

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli = initCommandLine({ state$: this.state$ });

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    // Save and resume the current view using local-storage.
    const view = fromStorage<t.TestViewType>(KEY.VIEW, this.viewType);
    this.cli.change({ text: view || '', namespace: true });
    this.state$.next({ view });
    state$.subscribe(() => {
      localStorage.setItem(KEY.VIEW, this.viewType);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get viewType(): t.TestViewType {
    return this.state.view || 'text';
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical',
      }),
      main: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }),
      footer: css({
        backgroundColor: COLORS.DARK,
      }),
    };

    const view = this.viewType;
    const elGrid = view === 'text' && <TestText />;
    const elCellEditor = view === 'input' && <TestTextInput />;

    return (
      <div {...styles.base}>
        <div {...styles.main}>
          {elGrid}
          {elCellEditor}
        </div>
        <div {...styles.footer}>
          <CommandPrompt cli={this.cli} theme={'DARK'} />
        </div>
      </div>
    );
  }
}
