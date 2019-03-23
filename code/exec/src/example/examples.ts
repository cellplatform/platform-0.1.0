// tslint:disable
import * as runTasks from './runTasks';
import * as runCommands from './runCommands';

(async () => {
  console.log('🖐  run tasks in a list (example)\n');
  await runTasks.run();

  console.log('\n\n');
  console.log('🖐  run shell commands (example)\n');
  await runCommands.run();

  console.log();
})();
