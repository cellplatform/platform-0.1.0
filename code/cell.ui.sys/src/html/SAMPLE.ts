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

  const module1 = create.test(bus);
  const module2 = create.test(bus);

  // console.log("shell.id", shell.id)
  console.log('test1.id', module1.id);
  console.log('test2.id', module2.id);
  console.log('-------------------------------------------');

  shell.add(module1).label('foo');
  shell.add(module2, module1).tree.label('bar');

  shell
    // Module "One"
    .module(module1)
    .tree//.isSpinning(true)
    .label('foo')
    .description('Lorem ipsum dolar sit amet...')
    // .inline.isOpen(true)
    // .isVisible(true)
    .parent()
    .parent();
  // .parent()

  // Module "Two"
  // shell.module(module2).tree.label('bar');

  // shell.module(module1).tree.isSpinning(true).description('Lorem ipsum dolar sit amet...');

  // time.delay(1200, () => {
  //   test.dispose();
  // });
}
