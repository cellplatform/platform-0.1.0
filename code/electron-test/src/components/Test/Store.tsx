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
export type IStoreTestProps = {
  style?: GlamorValue;
};

export type IStoreTestState = {
  count?: number;
  data?: object;
};

export class StoreTest extends React.PureComponent<IStoreTestProps, IStoreTestState> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public state: IStoreTestState = {};
  private readonly unmounted$ = new Subject();

  private log!: renderer.ILog;
  private store!: renderer.IStoreClient<t.IMyStore>;

  public componentWillMount() {
    const { log, store } = this.context;
    this.log = log;
    this.store = store;
  }

  public componentDidMount() {
    this.read();

    const events$ = this.store.change$.pipe(takeUntil(this.unmounted$));
    events$.subscribe(e => {
      this.log.info('store.change$: ', e);
      if (e.keys.includes('count')) {
        // const count = (e.values.count || 0) as number;
        // this.setState({ count });
      }
      this.updateState();
    });
    this.updateState();
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
      <TestPanel title={`Store ${this.state.count}`}>
        <div {...styles.columns}>
          <div {...styles.colButtons}>
            <Button label={'keys'} onClick={this.keys} />
            <Button label={'read'} onClick={this.read} />
            <Button label={'read (all)'} onClick={this.readAll} />
            <Button label={'change (count)'} onClick={this.changeCount} />
            <Button label={'change (foo)'} onClick={this.changeFoo} />
            <Button label={'delete: count'} onClick={this.deleteHandler('count')} />
            <Button label={'delete: foo'} onClick={this.deleteHandler('foo')} />
            <Button label={'clear'} onClick={this.clear} />
            <Button label={'open in editor'} onClick={this.openInEditor} />
          </div>
          <div {...styles.colObject}>
            <ObjectView name={'store'} data={this.state.data} expandLevel={5} />
          </div>
        </div>
      </TestPanel>
    );
  }

  private async updateState() {
    const data = await this.store.read();
    const count = data.count;
    this.setState({ count, data });
  }

  private keys = async () => {
    const res = await this.store.keys();
    this.log.info('🌳 keys:', res);
  };

  private read = async () => {
    const res = await this.store.read('count', 'foo');
    this.log.info('🌳 read:', res);
    this.setState({ count: res.count || 0 });
  };

  private readAll = async () => {
    const res = await this.store.read();
    this.log.info('🌳 read (all):', res);
  };

  private changeCount = async () => {
    const value = (this.state.count || 0) + 1;
    const res = await this.store.write({ key: 'count', value });
    this.log.info('🌼  change count:', res);
  };

  private changeFoo = async () => {
    type F = t.IMyStore['foo'];
    const foo = await this.store.get<F>('foo', { bar: false });
    foo.bar = !foo.bar;
    await this.store.set('foo', foo);
  };

  private deleteHandler = (key: string) => {
    return async () => {
      await this.store.delete(key as any);
    };
  };

  private clear = async () => {
    await this.store.clear();
  };

  private openInEditor = () => {
    this.store.openInEditor();
  };
}
