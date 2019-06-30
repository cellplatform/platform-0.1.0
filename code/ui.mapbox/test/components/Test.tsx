import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { CommandShell, css, Map, t } from '../common';
import { TOKEN } from '../TOKEN';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  private map!: Map;
  private mapRef = (ref: Map) => (this.map = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    state$
      // Zoom.
      .pipe(
        filter(e => Boolean(e.zoom)),
        map(e => e.zoom as number),
      )
      .subscribe(zoom => (this.map.zoom = zoom));

    state$
      // Center.
      .pipe(
        filter(e => Boolean(e.center)),
        map(e => e.center as t.ILngLat),
      )
      .subscribe(center => (this.map.center = center));
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

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <Map
          ref={this.mapRef}
          accessToken={TOKEN}
          center={this.state.center}
          zoom={this.state.zoom}
          style={styles.map}
        />
      </CommandShell>
    );
  }
}
