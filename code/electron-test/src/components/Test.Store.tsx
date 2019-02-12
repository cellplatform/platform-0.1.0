import * as React from 'react';
import { Subject } from 'rxjs';

import { css, GlamorValue, log, store } from '../common';
import { Button } from './primitives';
import * as t from '../types';

/**
 * Test component.
 */
export type IStoreTestProps = {
  style?: GlamorValue;
};

export type IStoreTestState = {
  count?: number;
};

export class StoreTest extends React.PureComponent<
  IStoreTestProps,
  IStoreTestState
> {
  public state: IStoreTestState = {};
  private readonly unmounted$ = new Subject();
  // private count = this.store.get('count') || 0;

  public componentDidMount() {
    this.read();

    // const events$ = this.store.events$.pipe(takeUntil(this.unmounted$));
    // events$.subscribe(e => {
    //   log.info('events$: ', e);
    //   this.updateState();
    // });
    this.updateState();
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
        <h2>Store {this.state.count}</h2>
        <div {...styles.buttons}>
          <Button label={'keys'} onClick={this.keys} />
          <Button label={'read'} onClick={this.read} />
          <Button label={'read (all)'} onClick={this.readAll} />
          <Button label={'change (count)'} onClick={this.changeCount} />
          <Button label={'change (foo)'} onClick={this.changeFoo} />
          <Button
            label={'delete: count'}
            onClick={this.deleteHandler('count')}
          />
          <Button label={'delete: foo'} onClick={this.deleteHandler('foo')} />
          <Button label={'clear'} onClick={this.clear} />
        </div>
      </div>
    );
  }

  private async updateState() {
    const { count } = await store.read('count', 'foo');
    this.setState({ count });
  }

  private keys = async () => {
    const res = await store.keys();
    log.info('🌳 keys:', res);
  };

  private read = async () => {
    const res = await store.read('count', 'foo');
    log.info('🌳 read:', res);
    this.setState({ count: res.count || 0 });
  };

  private readAll = async () => {
    const res = await store.read();
    log.info('🌳 read (all):', res);
  };

  private changeCount = async () => {
    const value = (this.state.count || 0) + 1;
    const res = await store.write({ key: 'count', value });
    log.info('🌼  change count:', res);
    this.read();
  };

  private changeFoo = async () => {
    type F = t.IMyStore['foo'];
    const foo = await store.get<F>('foo', { bar: false });
    foo.bar = !foo.bar;
    await store.set('foo', foo);
    this.read();
  };

  private deleteHandler = (key: string) => {
    return async () => {
      await store.delete(key as any);
      this.read();
    };
  };

  private clear = async () => {
    await store.clear();
    this.read();
  };
}
