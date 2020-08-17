import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button } from '../../../../components/primitives';
import { color, COLORS, css, CssValue, Module, t } from '../../common';

export type ITestSampleProps = {
  module: string;
  selected?: string;
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
    const module = Module.fire(ctx.bus).request<t.MyProps>(this.props.module).module;
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
    const styles = {
      base: css({
        flex: 1,
        color: COLORS.DARK,
        boxSizing: 'border-box',
      }),
      body: css({
        Absolute: 0,
        padding: 20,
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
        Flex: 'horizontal-end-spaceBetween',
        borderTop: `solid 5px ${color.format(-0.06)}`,
        paddingTop: 10,
        overflow: 'hidden',
      }),
    };

    const URL = {
      KONG: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/kong.png',
      LEAF: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png',
      KITTEN: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/kitten.png',
    };

    const src = URL.LEAF;

    // const src =
    //   e.tree.current === e.module
    //     ? e.tree.selection?.id.endsWith(':one')
    //       ? URL.KITTEN
    //       : URL.KONG
    //     : URL.LEAF;

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.top}>
            <img src={src} {...styles.image} />
          </div>
          <div {...styles.bottom}>
            {this.renderIdentifiers()}
            <Button onClick={this.onAddModuleClick}>Add Module</Button>
          </div>
        </div>
      </div>
    );
  }

  private renderIdentifiers() {
    const selected = this.props.selected;

    const styles = {
      base: css({}),
      code: css({
        fontFamily: 'Menlo, monospace',
        color: COLORS.CLI.MAGENTA,
        fontSize: 10,
        margin: 0,
      }),
    };
    return (
      <div {...styles.base}>
        <pre {...styles.code}>
          <div>{`Module:   ${this.module?.id}`}</div>
          <div>{`Selected: ${selected || '<empty>'}`}</div>
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
      const bus = this.context.bus;
      const child = Module.create({ bus, root: 'child' });

      /**
       * TODO 🐷
       * this is not adding it to the right parent
       */

      console.group('🌳 Add Module');
      console.log('parent.id', parent.id);
      console.log('parent', parent);
      console.groupEnd();

      Module.register(bus, child, parent.id);
    }
  };
}
