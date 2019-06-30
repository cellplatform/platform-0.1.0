import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { css, CommandShell, t, Map } from '../common';
import { TOKEN } from '../TOKEN';

/**
 * token name:        @platform/ui.mapbox
 * manage:            https://account.mapbox.com/access-tokens
 * url restrictions:  http://localhost
 */

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
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
      map: css({ flex: 1 }),
    };

    // const accessToken =
    //   'pk.eyJ1IjoicGhpbGNvY2tmaWVsZCIsImEiOiJjanhpYmg5bTgxZ2FjM29wNmZweG1qc2FzIn0.EBTWmmKgxg9jXKXJw7KIlQ';

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <Map accessToken={TOKEN} style={styles.map} />
      </CommandShell>
    );
  }
}
