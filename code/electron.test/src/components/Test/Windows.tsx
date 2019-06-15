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

  private unmounted$ = new Subject<{}>();

  public componentDidMount() {
    this.setState({
      current: this.context.windows.toObject(),
    });

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
            <Button label={'refresh (MAIN)'} onClick={this.refreshMain} />
            <Button label={'write (MAIN)'} onClick={this.writeMain} />
            <Button
              label={'tag (this, "FOO=123")'}
              onClick={this.tagHandler(this.context.id, 'FOO', 123)}
            />
            <Button label={'tag (2, "BAR=true")'} onClick={this.tagHandler(2, 'BAR', true)} />
            <Button label={'hide (2)'} onClick={this.visibleHandler(false, 2)} />
            <Button label={'show (2)'} onClick={this.visibleHandler(true, 2)} />
          </div>
          <div {...styles.colObject}>
            <ObjectView name={'windows'} data={this.data} expandLevel={1} />
          </div>
        </div>
      </TestPanel>
    );
  }

  private get data() {
    const current = this.state.current;
    const focused = current.focused;
    const tags = current.refs
      .map(ref => ref.tags.map(item => `${item.tag}=${item.value || 'undefined'}`))
      .flat();
    return {
      ...this.state.current,
      focused: focused ? focused.id : undefined,
      tags,
    };
  }

  private newWindow = () => {
    const { ipc } = this.context;
    ipc.send<t.ITestNewWindowEvent>('TEST/window/new', {}, { target: ipc.MAIN });
  };

  private refresh = () => {
    this.context.windows.refresh();
  };

  private refreshMain = () => {
    const { ipc } = this.context;
    ipc.send<t.ITestWindowsRefreshEvent>('TEST/windows/refresh', {}, { target: ipc.MAIN });
  };

  private writeMain = () => {
    const { ipc } = this.context;
    ipc.send<t.ITestWindowsWriteMainEvent>('TEST/windows/write/main', {}, { target: ipc.MAIN });
  };

  private tagHandler = (windowId: number, tag: string, value: string | number | boolean) => {
    return () => {
      this.context.windows.tag(windowId, { tag, value });
    };
  };

  private visibleHandler = (isVisible: boolean, ...windowId: number[]) => {
    return () => {
      this.context.windows.visible(isVisible, ...windowId);
    };
  };
}
