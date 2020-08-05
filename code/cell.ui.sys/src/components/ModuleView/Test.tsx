import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { time, color, css, CssValue, t, ui } from '../../common';
import { ModuleView } from '.';

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
export type ITestState = t.Object;

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();

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

    // Module.identity
    Module.publish({
      module,
      fire: ctx.fire,
      until$: this.unmounted$,
    });

    const foo = await Module.register(module, { id: 'foo', name: 'MyFoo' });
    const bar = await Module.register(module, { id: 'bar', name: 'MyBar' });

    console.log('module.children.length', module.children.length);
    console.log('- module     ', module.id);
    console.log('- child.foo  ', foo.id);
    console.log('- child.bar  ', bar.id);
    console.log('-------------------------------------------');

    Module.events(ctx.event$)
      // .filter((e) => e.id === foo.id)
      .render$.subscribe((e) => {
        if (e.id === bar.id) {
          e.render(this.renderKong(e));
        } else {
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
        // children.push(...[{ id: 'one' }]);
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

    /**
     * TODO 🐷
     * Ensure the tree does not reset BLUE selection
     * when timer reset prop on tree-node.
     */

    time.delay(1000, () => {
      bar.change((draft, ctx) => {
        const child = ctx.children(draft)[0];
        ctx.props(child, (props) => {
          props.treeview = { ...props.treeview, label: 'hello' };
        });
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
              event$={event$}
              filter={this.leftFilter}
              fire={ctx.fire}
              tag={'left'}
            />
          </div>
          <div {...styles.main}>
            <ModuleView.Frame style={styles.fill} event$={event$} filter={this.renderFilter} />
          </div>
          <div {...css(styles.tree, { marginLeft: MARGIN })}>
            <ModuleView.Tree
              style={styles.fill}
              event$={event$}
              filter={this.rightFilter}
              fire={ctx.fire}
              tag={'right'}
            />
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
        Flex: 'vertical-center-center',
        fontSize: 12,
      }),
      image: css({
        width: 300,
        marginBottom: 15,
      }),
    };
    const node = e.tree.node;

    const URL = {
      KONG: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/kong.png',
      LEAF: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png',
      KITTEN: 'https://tdb.sfo2.digitaloceanspaces.com/tmp/kitten.png',
    };

    const src =
      e.tree.current === e.id
        ? e.tree.selected?.endsWith(':one')
          ? URL.KITTEN
          : URL.KONG
        : URL.LEAF;

    return (
      <div {...styles.base}>
        <img src={src} {...styles.image} />
        <div>Module: {e.id}</div>
        <div>Tree Node: {node?.id || '-'}</div>
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
      }),
      image: css({
        width: '80%',
        // marginBottom: 15,
      }),
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

  private leftFilter: t.ModuleFilter = (args) => {
    const module = this.module;
    return module.id === args.id;
  };

  private rightFilter: t.ModuleFilter = (args) => {
    const module = this.module.find((e) => e.key === 'bar');
    return module?.id === args.id;
  };

  private renderFilter: t.ModuleFilter = (args) => {
    return true;
  };
}
