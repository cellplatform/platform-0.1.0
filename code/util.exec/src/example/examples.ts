// tslint:disable
import * as runTasks from './runTasks';
import * as runCommands from './runCommands';

(async () => {
  console.log('🖐  run tasks (listr)\n');
  await runTasks.run();

  console.log('\n\n');
  console.log('🖐  run shell commands\n');
  await runCommands.run();

  console.log();
})();
