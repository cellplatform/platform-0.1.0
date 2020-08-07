import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue } from '../../../common';
import { Button } from '../../primitives';
import * as t from './types';

import { ModuleView } from '..';
const Module = ModuleView.Module;

export type ITestKongProps = {
  e: t.IModuleRender;
  id: string;
  style?: CssValue;
};
export type ITestKongState = t.Object;

export class TestKong extends React.PureComponent<ITestKongProps, ITestKongState> {
  public state: ITestKongState = {};
  private state$ = new Subject<Partial<ITestKongState>>();
  private unmounted$ = new Subject();

  public static contextType = Module.Context;
  public context!: t.MyContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get module() {
    return this.context.module;
  }

  /**
   * [Render]
   */
  public render() {
    const ctx = this.context;
    console.log('ctx', ctx);

    const e = this.props.e;

    const styles = {
      base: css({
        padding: 30,
        flex: 1,
        Flex: 'vertical-stretch-stretch',
        overflow: 'hidden',
      }),
      image: css({
        width: 300,
        marginBottom: 15,
      }),
      top: css({
        flex: 1,
        Flex: 'vertical-center-center',
        fontSize: 12,
      }),
      bottom: css({
        // padding: 10
      }),
    };
    const node = e.tree.selection?.id;

    const URL = {
      KONG: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/kong.png',
      LEAF: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png',
      KITTEN: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/kitten.png',
    };

    const src =
      e.tree.current === e.module
        ? e.tree.selection?.id.endsWith(':one')
          ? URL.KITTEN
          : URL.KONG
        : URL.LEAF;

    return (
      <div {...styles.base}>
        <div {...styles.top}>
          <img src={src} {...styles.image} />
          <div>Module: {e.module}</div>
          <div>Tree Node: {node || '-'}</div>
        </div>
        <div {...styles.bottom}>
          <Button onClick={this.onAddModuleClick}>Add Module</Button>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onAddModuleClick = async () => {
    const module = this.context.module;
    const child = Module.register(module, { id: 'child', label: 'MyChild' });
    console.log('child', child);
  };
}
