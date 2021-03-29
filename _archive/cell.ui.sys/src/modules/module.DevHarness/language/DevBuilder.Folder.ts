import { Module, R, t } from '../common';
import { DevBuilderComponent } from './DevBuilder.Component';
import { changer } from './util';

type B = t.EventBus;
type P = t.HarnessProps;

type IArgs = { name: string; bus: B; module: t.HarnessModule; parent: string };

/**
 * Represents an organizing folder within the tree.
 */
export class DevBuilderFolder implements t.DevBuilderFolder {
  /**
   * [Lifecycle]
   */
  public static create(
    args: IArgs,
    options: { existing?: t.DevBuilderFolder[] } = {},
  ): t.DevBuilderFolder {
    if (options.existing) {
      const name = (args.name || '').trim();
      const existing = options.existing.find((item) => item.props.folder?.name === name);
      if (existing) {
        return existing;
      }
    }

    const res = new DevBuilderFolder(args);

    if (options.existing) {
      options.existing.push(res);
    }
    return res;
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;
    this.module = args.module;
    this.parent = args.parent;

    // Setup data.
    this.index = (this.root.children || []).length;
    this.change.data((data) => (data.kind = 'harness.folder'));
    this.name(args.name);

    // Ensure child nodes are shown with "inline" twisties within the tree.
    if (this.parent !== this.module.id) {
      this.module.change((draft, ctx) => {
        const node = ctx.findById(this.parent);
        if (node) {
          const props = node.props || (node.props = {});
          const treeview = props.treeview || (props.treeview = {});
          treeview.inline || (treeview.inline = {});
        }
      });
    }

    // Setup events.
    const match: t.ModuleFilterEvent = (e) => e.module == this.module.id;
    this.events = Module.events<P>(Module.filter(this.bus.event$, match), this.module.dispose$);
  }

  /**
   * [Fields]
   */
  private readonly parent: string;
  private readonly index: number;
  private readonly bus: B;
  private readonly module: t.HarnessModule;
  private readonly events: t.IViewModuleEvents<any>;
  private readonly components: t.DevBuilderComponent[] = [];
  private readonly folders: t.DevBuilderFolder[] = [];

  /**
   * [Properties]
   */
  private get root() {
    return this.module.query.findById(this.parent) as t.ITreeNode<P>;
  }

  public get id() {
    return (this.root.children || [])[this.index]?.id || '';
  }

  public get props(): t.DevBuilderFolderProps {
    const id = this.id;
    const props = (this.root.children || [])[this.index]?.props || {};
    const data = (props?.data || {}) as t.HarnessDataFolder;
    const folder = data.folder || { name: '' };
    const treeview = props.treeview || {};
    return R.clone({ id, folder, treeview });
  }

  private get change() {
    const methods = changer<t.HarnessDataFolder>({
      index: this.index,
      module: this.module,
      root: this.root,
    });

    const folder = (fn: (props: t.IDevFolder) => void) => {
      return methods.data((props) => fn(props.folder || (props.folder = { name: '' })));
    };

    return { ...methods, folder };
  }

  /**
   * [Methods]
   */
  public name(value: string) {
    value = (value || '').trim();
    const change = this.change;
    change.folder((props) => (props.name = value));
    change.treeview((props) => (props.label = value));
    return this;
  }

  public folder(name: string) {
    return DevBuilderFolder.create(
      { name, bus: this.bus, module: this.module, parent: this.id },
      { existing: this.folders },
    );
  }

  public component(name: string) {
    return DevBuilderComponent.create(
      { name, bus: this.bus, module: this.module, parent: this.id },
      { existing: this.components },
    );
  }
}
