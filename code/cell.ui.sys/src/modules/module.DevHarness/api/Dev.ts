import { t, Module, DEFAULT, R } from '../common';
import { DevComponent } from './DevComponent';

type B = t.EventBus;
type IArgs = { bus: B; label?: string };

/**
 * API for building out component tests within the UIHarness.
 */
export class Dev implements t.IDev {
  /**
   * [Lifecycle]
   */
  public static create(bus: B, label?: string): t.IDev {
    return new Dev({ bus, label });
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;

    this.module = Module.create<t.DevProps>({
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
  public readonly module: t.DevModule;

  /**
   * [Properties]
   */

  public get isDisposed() {
    return this.module.isDisposed;
  }

  public get dispose$() {
    return this.module.dispose$;
  }

  public get props(): t.DevProps {
    return R.clone(this.module.root.props || {});
  }

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
