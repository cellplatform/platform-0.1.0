import { id, Module, t, time } from '../common';
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
  /**
   * TEMP
   */
  const shell = Shell.builder(bus);

  shell.name('Hello');
  time.delay(800, () => shell.name('Hello World!'));

  const test1 = create.test(bus);
  const test2 = create.test(bus);

  // console.log("shell.id", shell.id)
  console.log('test1.id', test1.id);
  console.log('test2.id', test2.id);
  console.log('-------------------------------------------');

  shell.add(test1).label('foo');
  shell.add(test2, test1).tree.label('bar');

  // time.delay(1200, () => {
  //   test.dispose();
  // });
}
