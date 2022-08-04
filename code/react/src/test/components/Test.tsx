import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue } from '../common';
import { DragTest } from './DragTest';
import { EventsTest } from './EventsTest';
import { KeyboardTest } from './KeyboardTest';
import { Button } from './Button';

const STORAGE = { VIEW: 'TEST/REACT/view' };
type View = 'drag' | 'events' | 'keyboard';

export type ITestProps = { style?: CssValue };
export type ITestState = {
  view?: View;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject<void>();
  private state$ = new Subject<Partial<ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe((e) => {
      this.setState(e, () => {
        localStorage.setItem(STORAGE.VIEW, this.view);
      });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get view(): View {
    return this.state.view || (localStorage.getItem(STORAGE.VIEW) as View) || 'drag';
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        Absolute: 0,
        boxSizing: 'border-box',
      }),
      left: css({
        width: 200,
        fontSize: 14,
        padding: 8,
        Flex: 'vertical',
        lineHeight: 1.6,
      }),
      main: css({
        position: 'relative',
        borderLeft: `solid 1px ${color.format(-0.15)}`,
        flex: 1,
        display: 'flex',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.buttonView('drag')}
          {this.buttonView('events')}
          {this.buttonView('keyboard')}
        </div>
        <div {...styles.main}>{this.renderView()}</div>
      </div>
    );
  }

  private renderView() {
    const view = this.view;

    switch (view) {
      case 'drag':
        return <DragTest />;

      case 'events':
        return <EventsTest />;

      case 'keyboard':
        return <KeyboardTest />;

      default:
        return <div>View [{view}] not supported</div>;
    }
  }

  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} />;
  };

  private buttonView = (view: View) => {
    return this.button(view, () => this.state$.next({ view }));
  };
}
