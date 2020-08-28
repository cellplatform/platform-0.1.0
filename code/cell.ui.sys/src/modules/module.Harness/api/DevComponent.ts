import { t, Module, DEFAULT, id } from '../common';

type B = t.EventBus;
type P = t.DevProps;
type S = string;

type IArgs = { label: string; bus: B; module: t.DevModule };

/**
 * Represents a single component under test.
 */
export class DevComponent<V extends S = S> implements t.IDevComponent<V> {
  /**
   * [Lifecycle]
   */
  public static create(args: IArgs): t.IDevComponent {
    return new DevComponent(args);
  }

  private constructor(args: IArgs) {
    this.bus = args.bus;
    this.module = args.module;

    const children = this.module.root.children || [];
    this.index = children.length;

    // this.module.change((draft, ctx) => {

    this.change((props) => (props.view = 'HOST/component'));
    this.label(args.label);

    // })
  }

  /**
   * [Fields]
   */
  private readonly index: number;
  private readonly bus: B;
  private readonly module: t.DevModule;

  /**
   * [Methods]
   */
  public label(value: string) {
    value = (value || '').trim() || DEFAULT.UNTITLED;
    this.treeview((props) => (props.label = value));
    return this;
  }

  public view(name: V | undefined) {
    this.host((props) => (props.view = name));
    return this;
  }

  /**
   * [Helpers]
   */

  private change(fn: (props: P) => void) {
    this.module.change((draft, ctx) => {
      const index = this.index;
      const children = draft.children || (draft.children = []);
      const node = children[index] || { id: id.shortid() };
      const props = node.props || (node.props = {});
      props.view = 'HOST/component';
      fn(props);
      children[index] = node;
    });
    return this;
  }

  private treeview(fn: (props: t.ITreeviewNodeProps) => void) {
    this.change((props) => fn(props.treeview || (props.treeview = {})));
    return this;
  }

  private host(fn: (props: t.HarnessHost) => void) {
    this.change((props) => {
      const data = props.data || (props.data = {});
      const host = data.host || (data.host = {});
      fn(host);
    });
    return this;
  }
}
