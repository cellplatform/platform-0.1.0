import { t, time } from '../common';
import * as HARNESS from '../modules/module.DevHarness/.dev/SAMPLE';
import { Shell } from '../modules/module.Shell';

/**
 * Test configruation.
 */
export async function SAMPLE(bus: t.EventBus) {
  HARNESS.SAMPLE(bus);

  /**
   * TEMP
   */
  const shell = Shell.builder(bus);

  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');
  shell.name('MyName');

  time.delay(800, () => {
    shell.name('hello');
  });
}
