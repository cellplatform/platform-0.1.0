import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
} from 'rxjs/operators';
import * as React from 'react';

import { css, GlamorValue, renderer } from '../../common';
import { Button, ObjectView } from '../primitives';
import * as t from '../../types';

/**
 * Test component.
 */
export type IWindowsTestProps = {
  style?: GlamorValue;
};

export type IWindowsTestState = {
  windows?: renderer.IWindowRef[];
};

export class WindowsTest extends React.PureComponent<
  IWindowsTestProps,
  IWindowsTestState
> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  public state: IWindowsTestState = { windows: [] };

  private unmounted$ = new Subject();

  public componentDidMount() {
    this.setState({ windows: this.context.windows.refs });
    this.context.windows.change$
      .pipe(takeUntil(this.unmounted$))
      .subscribe(e => this.setState({ windows: e.windows }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const styles = {
      base: css({ marginBottom: 50 }),
      columns: css({
        Flex: 'horizontal-start-spaceBetween',
      }),
      colButtons: css({
        lineHeight: '1.6em',
        Flex: 'vertical-start',
        paddingLeft: 15,
        flex: 1,
      }),
      colObject: css({
        flex: 1,
      }),
    };

    return (
      <div {...styles.base}>
        <h2>Windows</h2>
        <div {...styles.columns}>
          <div {...styles.colButtons}>
            <Button label={'new window'} onClick={this.newWindow} />
            <Button label={'refresh'} onClick={this.refresh} />
          </div>
          <div {...styles.colObject}>
            <ObjectView
              name={'windows'}
              data={this.state.windows}
              expandLevel={1}
            />
          </div>
        </div>
      </div>
    );
  }

  private newWindow = () => {
    const { ipc } = this.context;
    ipc.send<t.INewWindowEvent>('NEW_WINDOW', {}, { target: ipc.MAIN });
  };

  private refresh = () => {
    this.context.windows.refresh();
  };
}
