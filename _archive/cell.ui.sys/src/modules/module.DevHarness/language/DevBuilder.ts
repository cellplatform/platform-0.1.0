import { t, Module, DEFAULT, R } from '../common';
import { DevBuilderComponent } from './DevBuilder.Component';
import { DevBuilderFolder } from './DevBuilder.Folder';

type B = t.EventBus;
type IArgs = { bus: B; label?: string };

/**
 * API for building out component tests within the DevHarness.
 */
export class DevBuilder implements t.DevBuilder {
  /**
   * [Lifecycle]
   */
  public static create(bus: B, label?: string): t.DevBuilder {
    return new DevBuilder({ bus, label });
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;

    this.module = Module.create<t.HarnessProps>({
      bus: args.bus,
      root: {
        id: '',
        props: {
          treeview: { label: DEFAULT.UNTITLED },
          data: { kind: 'harness.root', shell: '' },
        },
      },
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
  private readonly components: t.DevBuilderComponent[] = [];
  private readonly folders: t.DevBuilderFolder[] = [];

  /**
   * [Properties]
   */

  public get isDisposed() {
    return this.module.isDisposed;
  }

  public get dispose$() {
    return this.module.dispose$;
  }

  public get id() {
    return this.module.id;
  }

  public get props(): t.DevBuilderProps {
    const id = this.id;
    const props = this.module.state.props;
    const treeview = props?.treeview || {};
    return R.clone({ id, treeview });
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
    return DevBuilderComponent.create(
      { name, bus: this.bus, module: this.module, parent: this.id },
      { existing: this.components },
    );
  }

  /**
   * An oranizing folder within the module.
   */
  public folder(name: string) {
    return DevBuilderFolder.create(
      { name, bus: this.bus, module: this.module, parent: this.id },
      { existing: this.folders },
    );
  }
}
