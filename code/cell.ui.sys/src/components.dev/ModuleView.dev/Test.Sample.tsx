import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue } from '../../common';
import { Button } from '../../components/primitives';
import * as t from './types';

import { ModuleView } from '@platform/cell.ui/lib/components/ModuleView';
const Module = ModuleView.Module;

export type ITestSampleProps = {
  e: t.IModuleRender;
  module: string;
  style?: CssValue;
};
export type ITestSampleState = { module?: t.MyModule };

export class TestSample extends React.PureComponent<ITestSampleProps, ITestSampleState> {
  public state: ITestSampleState = {};
  private state$ = new Subject<Partial<ITestSampleState>>();
  private unmounted$ = new Subject();

  public static contextType = Module.Context;
  public context!: t.MyContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    // SAMPLE: Retrieve the module from via a REQUEST event.
    //
    // NB:     This could also have been retrieved from the [context]
    //         but is being "requested" in this way to demonstrate
    //         how this is one.
    const module = Module.fire(ctx.fire).request<t.MyModule>(this.props.module).module;
    this.state$.next({ module });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get module() {
    return this.state.module;
  }

  /**
   * [Render]
   */
  public render() {
    // const ctx = this.context;
    // console.log('ctx', ctx);

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
    if (this.module) {
      const module = this.module;
      const child = Module.register(module).add({ id: 'child', treeview: 'MyChild' });
      console.log('child', child);
    }
  };
}
