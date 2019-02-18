import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, renderer } from '../../common';
import * as t from '../../types';
import { Button, ObjectView } from '../primitives';
import { TestPanel } from '../TestPanel';

/**
 * Test component.
 */
export type IWindowsTestProps = {
  style?: GlamorValue;
};

export type IWindowsTestState = {
  current: renderer.IWindowsState;
};

export class WindowsTest extends React.PureComponent<IWindowsTestProps, IWindowsTestState> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  public state: IWindowsTestState = { current: { refs: [] } };

  private unmounted$ = new Subject();

  public componentDidMount() {
    this.setState({ current: this.context.windows.toObject() });
    const change$ = this.context.windows.change$.pipe(takeUntil(this.unmounted$));
    change$.subscribe(e => {
      this.setState({ current: e.state });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const styles = {
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
      <TestPanel title={'Windows'}>
        <div {...styles.columns}>
          <div {...styles.colButtons}>
            <Button label={'new window'} onClick={this.newWindow} />
            <Button label={'refresh'} onClick={this.refresh} />
          </div>
          <div {...styles.colObject}>
            <ObjectView name={'windows'} data={this.state.current} expandLevel={1} />
          </div>
        </div>
      </TestPanel>
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
