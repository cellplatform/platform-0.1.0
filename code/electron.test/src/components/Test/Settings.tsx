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
export type ISettingsProps = { style?: GlamorValue };
export type ISettingsState = {
  count?: number;
  data?: object;
};

export class SettingsTest extends React.PureComponent<ISettingsProps, ISettingsState> {
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public state: ISettingsState = {};
  private readonly unmounted$ = new Subject();

  private log!: renderer.ILog;
  private settings!: renderer.ISettingsClient<t.IMyStore>;

  public componentWillMount() {
    const { log, settings } = this.context;
    this.log = log;
    this.settings = settings;
  }

  public componentDidMount() {
    this.read();

    const events$ = this.settings.change$.pipe(takeUntil(this.unmounted$));
    events$.subscribe(e => {
      this.log.info('settings.change$: ', e);
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
      <TestPanel title={`Settings (count: ${this.state.count || 0})`}>
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
            <ObjectView name={'settings'} data={this.state.data} expandLevel={5} />
          </div>
        </div>
      </TestPanel>
    );
  }

  private async updateState() {
    const data = await this.settings.read();
    const count = data.count;
    this.setState({ count, data });
  }

  private keys = async () => {
    const res = await this.settings.keys();
    this.log.info('🌳 keys:', res);
  };

  private read = async () => {
    const res = await this.settings.read('count', 'foo');
    this.log.info('🌳 settings.read:', res);
    this.setState({ count: res.count || 0 });
  };

  private readAll = async () => {
    const res = await this.settings.read();
    this.log.info('🌳 read (all):', res);
  };

  private changeCount = async () => {
    const value = (this.state.count || 0) + 1;
    const res = await this.settings.write({ key: 'count', value });
    this.log.info('🌼  change count:', res);
  };

  private changeFoo = async () => {
    const foo = await this.settings.get('foo', { bar: false });
    foo.bar = !foo.bar;
    await this.settings.set('foo', foo);
  };

  private deleteHandler = (key: string) => {
    return async () => {
      await this.settings.delete(key as any);
    };
  };

  private clear = async () => {
    await this.settings.clear();
  };

  private openInEditor = () => {
    this.settings.openInEditor();
  };
}
