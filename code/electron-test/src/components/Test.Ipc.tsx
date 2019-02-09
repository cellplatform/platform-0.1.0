import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, ipc, log, renderer, types, time } from '../common';
import { Button } from './primitives';

/**
 * Test component.
 */
export type IIpcTestProps = {
  style?: GlamorValue;
};

export class IpcTest extends React.PureComponent<IIpcTestProps> {
  public windowId: number;
  private unmounted$ = new Subject();

  constructor(props: IIpcTestProps) {
    super(props);
    this.windowId = renderer.id;

    /**
     * Log out events.
     */
    ipc.events$.pipe(takeUntil(this.unmounted$)).subscribe(e => {
      const from = e.sender.id;
      // log.info('from:', from, e);
    });

    // ipc.filter<IMessageEvent>('MESSAGE').subscribe(e => {
    //   log.info('filtered event', e);
    // });

    /**
     * Provide a response-handler for a specific event.
     */
    ipc.handle<types.IFooEvent>('FOO', async e => {
      await time.wait(1000);
      return `response FOO after delay (${this.windowId}) 🌼`;
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const styles = {
      base: css({ marginBottom: 50 }),
      buttons: css({
        lineHeight: '1.6em',
        Flex: 'vertical-start',
        paddingLeft: 15,
      }),
    };
    return (
      <div {...styles.base}>
        <h2>IPC ({this.windowId})</h2>
        <div {...styles.buttons}>
          <Button label={'new window'} onClick={this.newWindow} />
          <Button label={'send: foo (response)'} onClick={this.sendFoo} />
          <Button label={'send: message (all)'} onClick={this.sendMessage} />
          <Button
            label={'send: message (to 1)'}
            onClick={this.sendToHandler(1)}
          />
          <Button
            label={'send: message (to 1,3)'}
            onClick={this.sendToHandler(1, 3)}
          />
          <Button
            label={'send: message (to MAIN)'}
            onClick={this.sendToHandler(0)}
          />
          <Button label={'log.info'} onClick={this.logInfo} />
        </div>
      </div>
    );
  }

  private newWindow = () => {
    ipc.send<types.INewWindowEvent>('NEW_WINDOW', {}, { target: ipc.MAIN });
  };

  private sendMessage = () => {
    ipc.send<types.IMessageEvent>('MESSAGE', { text: 'Hello' });
  };

  private sendToHandler = (...target: number[]) => {
    return () => {
      ipc.send<types.IMessageEvent>('MESSAGE', { text: 'Hello' }, { target });
    };
  };

  private sendFoo = () => {
    const count = this.count++;
    const res = ipc.send<types.IFooEvent, string>(
      'FOO',
      { count },
      // { timeout: 100 },
    );
    // res.cancel();

    res.results$.subscribe({
      next: e => log.info('🤘 res$.next:', e),
      complete: () => {
        log.group('🌳 COMPLETE');
        res.results.forEach(result => log.info(result));
        // log.info('results', res.results);

        log.groupEnd();
      },
      error: err => log.error('😡  ERROR', err),
    });
  };
  private count = 0;

  private logInfo = () => {
    this.logCount++;
    log.info(`Hello from renderer (${this.windowId}) - ${this.logCount}`);
  };
  private logCount = 0;
}
