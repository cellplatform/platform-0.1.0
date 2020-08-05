import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { time, color, css, CssValue, t, ui } from '../../common';
import { ModuleView } from '.';

const Module = ModuleView.Module;

/**
 * Types
 */
export type MyModuleData = { selected?: string };
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
    Module.broadcast(module, ctx.fire, this.unmounted$);

    // const actions = module.action(this.unmounted$);
    const foo = await Module.register(module, { id: 'foo', name: 'MyFoo' });
    const bar = await Module.register(module, { id: 'bar', name: 'MyBar' });

    console.log('module.children.length', module.children.length);
    console.log('- module     ', module.id);
    console.log('- child.foo  ', foo.id);
    console.log('- child.bar  ', bar.id);
    console.log('-------------------------------------------');

    foo.change((draft, ctx) => {
      ctx.children(draft, (children) => {
        children.push({ id: 'foo' });
      });
    });

    bar.change((draft, ctx) => {
      ctx.children(draft, (children) => {
        children.push({ id: 'bar' });
      });
    });

    time.delay(1000, () => {
      bar.change((draft, ctx) => {
        const child = ctx.children(draft)[0];
        ctx.props(child, (props) => {
          props.treeview = { label: 'hello' };
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
              tag={'left'}
            />
          </div>
          <div {...styles.main}>
            <ModuleView.Frame style={styles.fill} event$={event$} />
          </div>
          <div {...css(styles.tree, { marginLeft: MARGIN })}>
            <ModuleView.Tree
              style={styles.fill}
              event$={event$}
              filter={this.rightFilter}
              tag={'right'}
            />
          </div>
        </div>
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
}
