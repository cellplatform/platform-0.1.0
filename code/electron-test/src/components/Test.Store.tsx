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

import {
  css,
  GlamorValue,
  ICreateDevToolsEvent,
  ipc,
  renderer,
  log,
  store,
} from '../common';
import { Button } from './primitives';

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
        <h2>Store </h2>
        <div {...styles.buttons}>
          <Button label={'read'} onClick={this.read} />
          <Button
            label={'change and save (increment)'}
            onClick={this.changeAndSave}
          />
          <Button
            label={'delete: count'}
            onClick={this.deleteHandler('count')}
          />
          <Button
            label={'delete: foo.bar'}
            onClick={this.deleteHandler('foo.bar')}
          />
          <Button label={'clear'} onClick={this.clear} />
          <Button label={'open in editor'} onClick={this.open} />
        </div>
      </div>
    );
  }

  private updateState() {
    // const count = store.get('count');
    // this.setState({ count });
  }

  private read = async () => {
    log.group('🌳 store');

    const s = await store.values('count', 'foo');

    // console.log('this.store.changes$', this.store.changes$);
    // log.info('store', store);
    // log.info('store.path', store.path);
    // log.info('store.size', store.size);
    // log.info('store.store', JSON.stringify(store.store));

    // const count = store.get('count');
    // const bar = store.get('foo.bar');
    // log.info('- count', count);
    // log.info('- foo.bar', bar);

    log.groupEnd();
  };

  private changeAndSave = () => {
    // this.count++;
    // const store = this.store;
    // store.set('count', this.count);
    // store.set('foo.bar', !store.get('foo.bar', true));
    // this.read();
  };

  private deleteHandler = (key: string) => {
    return () => {
      // this.store.delete(key);
      // this.read();
    };
  };

  private open = () => {
    // this.store.openInEditor();
  };

  private clear = () => {
    // this.store.clear();
    // this.read();
  };
}
