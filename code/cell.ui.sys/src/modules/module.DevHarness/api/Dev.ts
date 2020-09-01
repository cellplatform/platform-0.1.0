import { t, Module, DEFAULT, R } from '../common';
import { DevComponent } from './DevComponent';

type B = t.EventBus;
type IArgs = { bus: B; label?: string };

/**
 * API for building out component tests within the UIHarness.
 */
export class Dev implements t.IDevBuilder {
  /**
   * [Lifecycle]
   */
  public static create(bus: B, label?: string): t.IDevBuilder {
    return new Dev({ bus, label });
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;

    this.module = Module.create<t.HarnessProps>({
      bus: args.bus,
      root: { id: '', props: { treeview: { label: DEFAULT.UNTITLED } } },
    });

    if (args.label) {
      this.label(args.label);
    }
  }

  public dispose() {
    this.module.dispose();
  }

  /**
   * [Fields]
   */
  private readonly bus: B;
  public readonly module: t.HarnessModule;
  private readonly components: t.IDevComponentBuilder[] = [];

  /**
   * [Properties]
   */

  public get isDisposed() {
    return this.module.isDisposed;
  }

  public get dispose$() {
    return this.module.dispose$;
  }

  public get props(): t.IDevProps {
    const props = this.module.root.props;
    const treeview = props?.treeview || {};
    return R.clone({ treeview });
  }

  /**
   * [Methods]
   */

  /**
   * The display label for the module within the tree.
   */
  public label(value: string) {
    this.module.change((draft) => {
      const props = draft.props || (draft.props = {});
      const treeview = props.treeview || (props.treeview = {});
      treeview.label = (value || '').trim() || DEFAULT.UNTITLED;
    });
    return this;
  }

  /**
   * A defined component within the module.
   */
  public component(name: string) {
    name = (name || '').trim();
    const existing = this.components.find((item) => item.props.component.name === name);
    if (existing) {
      return existing;
    }

    const bus = this.bus;
    const module = this.module;
    const component = DevComponent.create({ name, bus, module });

    this.components.push(component);
    return component;
  }
}
