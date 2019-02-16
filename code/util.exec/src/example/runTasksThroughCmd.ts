import { exec } from '..';

/**
 * EXAMPLE:
 *
 * This example shows a Listr task execution list (`exec.tasks.run`)
 * being run within a child process (`exec.cmd.run`).
 *
 * This demonstrates how the spinning visuals from Listr breaks
 * when run as a child process.
 *
 * If you want the spinning visuals, make sure `exec.tasks.run` executes
 * within the main process where Listr has access to the `process.stdout` TTY.
 *
 */
(async () => {
  const cmd = 'node lib/example/runTasks';
  await exec.cmd.run(cmd);
})();
