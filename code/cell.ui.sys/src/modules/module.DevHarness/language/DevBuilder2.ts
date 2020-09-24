import { t, Module, Builder, DEFAULT, R } from '../common';
import { DevBuilderComponent } from './DevBuilder.Component';
import { DevBuilderFolder } from './DevBuilder.Folder';

// export type IDevModel = {
//   label: string;
// };

type M = t.ITreeNode<t.HarnessProps>;

export type IDev = {
  name(value: string): IDev;
};

const handlers: t.BuilderHandlers<M, IDev> = {
  name(args) {
    // TEMP 🐷
    args.change((draft) => {
      const props = draft.props || (draft.props = {});
      const treeview = props.treeview || (props.treeview = {});
      const value = (args.params[0] || '').trim();
      treeview.label = value || DEFAULT.UNTITLED;
    });
  },
};

type B = t.EventBus;
type IArgs = { bus: B; label?: string };

/**
 *
 */
export function DevBuilder2(bus: B) {
  //

  const module = Module.create<t.HarnessProps>({
    bus,
    root: {
      id: '',
      props: {
        treeview: { label: DEFAULT.UNTITLED },
        data: { kind: 'harness.root', shell: '' },
      },
    },
  });

  console.log('-------------------------------------------');
  console.log('module', module);

  const change = module.change;
  const getState = () => module.state;

  // module.store.state

  const builder = Builder.chain<M, IDev>({ getState, change, handlers });

  // builder.name('foo11');

  return { id: module.id };
}
