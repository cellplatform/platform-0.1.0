import { t, Module, DEFAULT } from '../common';
import { DevComponent } from './DevComponent';

type S = string;
type B = t.EventBus;
type IArgs = { bus: B };

/**
 * API for building out component tests within the UIHarness.
 */
export class Dev<V extends S = S> implements t.IDev<V> {
  /**
   * [Lifecycle]
   */
  public static create<V extends S = S>(bus: B): t.IDev<V> {
    return new Dev({ bus });
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;
    this.module = Module.create<t.DevProps>({
      bus: args.bus,
      root: { id: '', props: { treeview: { label: DEFAULT.UNTITLED } } },
    });
  }

  /**
   * [Fields]
   */
  private readonly bus: B;
  public readonly module: t.DevModule;

  /**
   * [Methods]
   */
  public label(value: string) {
    this.module.change((draft) => {
      const props = draft.props || (draft.props = {});
      const treeview = props.treeview || (props.treeview = {});
      treeview.label = (value || '').trim() || DEFAULT.UNTITLED;
    });
    return this;
  }

  public component(label: string) {
    const bus = this.bus;
    const module = this.module;
    return DevComponent.create({ label, bus, module });
  }
}
