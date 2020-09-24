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
    //
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

  // module.change
  // module.state

  // module.
  // module.ch

  const change = module.change;
  const getState = () => module.state;

  // module.store.state

  const builder = Builder.chain<M, IDev>({ getState, change, handlers });
  return { id: module.id };
}
