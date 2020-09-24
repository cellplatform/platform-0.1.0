import { t, Module, DEFAULT, R } from '../common';
import { DevBuilderComponent } from './DevBuilder.Component';
import { DevBuilderFolder } from './DevBuilder.Folder';

export type IDevModel = {
  label: string;
};

export type IDev = {
  name(value: string): IDev;
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
}
