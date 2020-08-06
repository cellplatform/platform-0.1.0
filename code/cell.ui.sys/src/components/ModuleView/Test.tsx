import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModuleView } from '.';
import { color, css, CssValue, t, time, ui } from '../../common';
import { Button } from '../primitives';

const Module = ModuleView.Module;

/**
 * Types
 */
export type MyModuleData = { foo?: string };
export type MyModule = t.IModule<MyModuleData, MyModuleEvent>;

export type MyModuleEvent = MyFooEvent;
export type MyFooEvent = { type: 'FOO/event'; payload: MyFoo };
export type MyFoo = { count: 123 };

/**
 * Component
 */
export type ITestProps = { style?: CssValue };
export type ITestState = { foo?: MyModule; bar?: MyModule };

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeViewEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  public module: MyModule = Module.create<MyModuleData, MyFooEvent>({
    dispose$: this.unmounted$,
    strategy: Module.strategies.default,
  });

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private async init() {
    const ctx = this.context;
    const module = this.module;

    // Publishes modules changes into the global event bus.
    Module.publish({
      until$: this.unmounted$,
      module,
      fire: ctx.fire,
    });

    const foo = await Module.register(module, { id: 'foo', name: 'Diagram' });
    const bar = await Module.register(module, { id: 'bar', name: 'Sample' });
    this.state$.next({ foo, bar });

    Module.events(ctx.event$).render$.subscribe((e) => {
      if (e.module === bar.id) {
        e.render(this.renderKong(e));
      }
      if (e.module === foo.id) {
        e.render(this.renderDiagram());
      }
    });

    foo.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.view = 'MyView'; // TODO - do this at registration
        props.data = { foo: 'foo-view' };
      });
      ctx.children(draft, (children) => {
        children.push(...[{ id: 'one' }, { id: 'two' }]);
      });
    });

    bar.change((draft, ctx) => {
      ctx.props(draft, (props) => {
        props.view = 'MyView'; // TODO - do this at registration
        props.data = { foo: 'bar-view' };
      });
      ctx.children(draft, (children) => {
        children.push({ id: 'zinger' });
        children.push(...[{ id: 'one' }, { id: 'two' }]);
      });
    });

    time.delay(1000, () => {
      bar.change((draft, ctx) => {
        const child = ctx.children(draft)[0];
        ctx.props(child, (props) => {
          props.treeview = { inline: {}, ...props.treeview, label: 'hello' };
        });
        if (!child.children) {
          child.children = [{ id: 'my-child-1', props: { treeview: { inline: {} } } }];
        }
      });
    });
  }

  /**
   * [Render]
   */
  public render() {
    const MARGIN = 40;

    const ctx = this.context;
    const event$ = ctx.event$;

    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
        boxSizing: 'border-box',
        WebkitAppRegion: 'drag',
      }),
      body: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        margin: MARGIN,
      }),
      tree: css({
        position: 'relative',
        width: 300,
        backgroundColor: color.format(1),
        WebkitAppRegion: 'none',
        display: 'flex',
      }),
      main: css({
        position: 'relative',
        flex: 1,
        backgroundColor: color.format(1),
        WebkitAppRegion: 'none',
      }),
      fill: css({ Absolute: 0 }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ModuleView.Tree
              style={styles.fill}
              tree={this.module}
              treeview$={this.treeview$}
              fire={ctx.fire}
            />
          </div>
          <div {...styles.main}>
            <ModuleView.Frame
              style={styles.fill}
              event$={event$}
              filter={this.renderFilter}
              fire={ctx.fire}
            />
          </div>
          <div {...css(styles.tree, { marginLeft: MARGIN })}>
            {this.state.bar && (
              <ModuleView.Tree
                style={styles.fill}
                tree={this.state.bar}
                treeview$={this.treeview$}
                fire={ctx.fire}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  private renderKong(e: t.IModuleRender) {
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

  private renderDiagram() {
    const PINK = '#FE0168';
    const styles = {
      base: css({
        Absolute: 0,
        border: `solid 10px ${PINK}`,
        Flex: 'vertical-center-center',
        overflow: 'hidden',
      }),
      image: css({ width: '80%' }),
    };

    const src = 'https://tdb.sfo2.digitaloceanspaces.com/tmp/framing-bypass.png';

    return (
      <div {...styles.base}>
        <img src={src} {...styles.image} />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private renderFilter: t.ModuleFilter = (args) => {
    return true;
  };

  private onAddModuleClick = async () => {
    // this.module
    const module = this.module;
    const child = await Module.register(module, { id: 'child', name: 'MyChild' });
  };
}
