import { t, time, Module, id } from '../common';
import * as HARNESS from '../modules/module.DevHarness/.dev/SAMPLE';
import { Shell } from '../modules/module.Shell';

type TestView = 'Default' | '404';
type TestRegion = 'Main';
type TestData = { count: number };
type TestProps = t.IViewModuleProps<TestData, TestView, TestRegion>;
type TestModule = t.IModule<TestProps>;

const create = {
  test(bus: t.EventBus) {
    const module = Module.create<TestProps>({ bus, kind: 'TEST', root: `${id.shortid()}.test` });
    return module;
  },
};

/**
 * Test configruation.
 */
export async function SAMPLE(bus: t.EventBus) {
  HARNESS.SAMPLE(bus);

  /**
   * TEMP
   */
  const shell = Shell.builder(bus);

  // shell.module()

  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');

  time.delay(800, () => {
    shell.name('hello');
  });

  const test = create.test(bus);
  // console.log('test.modules', test.modules);
  console.log('shell.modules', shell.modules);
  shell.modules.add(test);
}
