import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, css, color, CssValue, constants } from '../../common';

import MonacoEditor from '@monaco-editor/react';
import { MonacoApi } from '../Monaco.api';

const { MONACO } = constants;

export type IMonacoProps = { style?: CssValue };
export type IMonacoState = { api?: MonacoApi };

export class Monaco extends React.PureComponent<IMonacoProps, IMonacoState> {
  public static api = MonacoApi.singleton;

  public state: IMonacoState = {};
  private state$ = new Subject<Partial<IMonacoState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IMonacoProps) {
    super(props);
    Monaco.api(); // Ensure API is initialized and configured (singleton).
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0 }),
    };

    const TMP = `

const foo: number[] = [1,2,3]
foo.map(num => num + 1)

const app: AppWindow = {
  app: 'ns:foo',
  title: 'MyAppWindow',
  width: 200,
  height: 150,
  x: 0,
  y: 120,
}


`;

    return (
      <div {...css(styles.base, this.props.style)}>
        <MonacoEditor language={MONACO.LANGUAGE} theme={MONACO.THEME} value={TMP} />
      </div>
    );
  }
}
