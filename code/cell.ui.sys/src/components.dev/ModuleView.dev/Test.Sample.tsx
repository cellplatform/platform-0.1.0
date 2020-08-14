import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button } from '../../components/primitives';
import { color, COLORS, css, CssValue, ModuleView } from './common';
import * as t from './types';

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
    const bus = { fire: ctx.fire, event$: ctx.event$ };
    const module = Module.fire(bus).request<t.MyProps>(this.props.module).module;
    this.state$.next({ module });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get bus(): t.EventBus<any> {
    const { event$, fire } = this.context;
    return { event$, fire };
  }

  public get module() {
    return this.state.module;
  }

  /**
   * [Render]
   */
  public render() {
    const e = this.props.e;

    const styles = {
      base: css({
        padding: 20,
        flex: 1,
        Flex: 'vertical-stretch-stretch',
        overflow: 'hidden',
        color: COLORS.DARK,
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
        Flex: 'horizontal-end-spaceBetween',
        borderTop: `solid 5px ${color.format(-0.06)}`,
        paddingTop: 10,
      }),
    };

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
        </div>
        <div {...styles.bottom}>
          {this.renderIdentifiers()}
          <Button onClick={this.onAddModuleClick}>Add Module</Button>
        </div>
      </div>
    );
  }

  private renderIdentifiers() {
    const e = this.props.e;
    const selection = e.tree.selection?.id;

    const styles = {
      base: css({}),
      code: css({
        fontFamily: 'Menlo, monospace',
        color: COLORS.CLI.MAGENTA,
        fontSize: 12,
        margin: 0,
      }),
    };
    return (
      <div {...styles.base}>
        <pre {...styles.code}>
          <div>{`Module:   ${e.module}`}</div>
          <div>{`TreeNode: ${selection || '<empty>'}`}</div>
        </pre>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onAddModuleClick = async () => {
    const parent = this.module;
    if (parent) {
      const bus = this.bus;
      const child = Module.create({ bus, root: 'child' });
      Module.register(bus, child, parent.id);
    }
  };
}
