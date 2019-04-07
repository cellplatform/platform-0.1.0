import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, renderer, time } from '../../common';
import * as t from '../../types';
import { Button } from '../primitives';
import { TestPanel } from '../TestPanel';

/**
 * Test component.
 */
export type IIpcTestProps = {
  style?: GlamorValue;
};

export class IpcTest extends React.PureComponent<IIpcTestProps> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  private id!: number;
  private log!: renderer.ILog;
  private ipc!: renderer.IpcClient;
  private unmounted$ = new Subject();

  public componentWillMount() {
    const { id, log, ipc } = this.context;
    this.id = id;
    this.log = log;
    this.ipc = ipc;
    this.startTestHandlers();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const styles = {
      buttons: css({
        lineHeight: '1.6em',
        Flex: 'vertical-start',
        paddingLeft: 15,
      }),
    };
    return (
      <TestPanel title={`IPC (${this.id})`}>
        <div {...styles.buttons}>
          <Button label={'send: FOO (response handlers)'} onClick={this.sendFoo} />
          <Button label={'send: BAR (no handlers)'} onClick={this.sendBar} />
          <Button label={'send: message (all)'} onClick={this.sendMessage} />
          <Button label={'send: message (to 1)'} onClick={this.sendToHandler(1)} />
          <Button label={'send: message (to 1,3)'} onClick={this.sendToHandler(1, 3)} />
          <Button label={'send: message (to MAIN)'} onClick={this.sendToHandler(0)} />
          <Button label={'log.info'} onClick={this.logInfo} />
        </div>
      </TestPanel>
    );
  }

  private startTestHandlers = () => {
    /**
     * Log out events.
     */
    this.ipc.events$.pipe(takeUntil(this.unmounted$)).subscribe(e => {
      // const from = e.sender.id;
      // this.log.info('⚡️ from:', from, e);
    });
    this.ipc.filter<t.IMessageEvent>('TEST/message').subscribe(e => {
      this.log.info('filtered event', e);
    });

    /**
     * Provide a response-handler for a specific event.
     */
    this.ipc.handle<t.IFooEvent>('FOO', async e => {
      await time.wait(1000);
      return `response FOO after delay (${this.id}) 🌼`;
    });
  };

  private sendMessage = () => {
    this.ipc.send<t.IMessageEvent>('TEST/message', { text: 'Hello' });
  };

  private sendToHandler = (...target: number[]) => {
    return () => {
      this.ipc.send<t.IMessageEvent>('TEST/message', { text: 'Hello' }, { target });
    };
  };

  private sendFoo = () => {
    console.group('🌳 Send Foo');

    const count = this.count++;
    const res = this.ipc.send<t.IFooEvent, string>(
      'FOO',
      { count },
      // { timeout: 100 },
    );
    // res.cancel();

    console.log(
      `\nTODO 🐷   if res is sent through IPC log it hangs renderer process - convert to safe JSON?\n`,
    );

    console.log('res', res);
    this.log.info('isComplete', res.isComplete);
    this.log.info('handlers (FOO)', this.ipc.handlers('FOO'));

    res.$.subscribe({
      next: e => this.log.info('🤘 res$.next:', e),
      complete: () => {
        this.log.group('🚀 COMPLETE');
        res.results.forEach(result => this.log.info(result));
        this.log.info('elapsed', res.elapsed);
        this.log.info('isComplete', res.isComplete);
        this.log.groupEnd();
      },
      error: err => this.log.error('😡  ERROR', err),
    });

    console.groupEnd();
  };
  private count = 0;

  private sendBar = () => {
    const res = this.ipc.send<t.IBarEvent, string>('BAR', {});
    console.log('res', res);
  };

  private logInfo = () => {
    const { log } = this.context;
    this.logCount++;
    log.info(`Hello from renderer (${this.id}) - ${this.logCount}`);
  };
  private logCount = 0;
}
