import * as uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json');

/**
 * Initialize the default [main] window process with the [UIHarness].
 *
 * NOTE:
 *  To do you own thing, simply disregard this and write your own.
 *
 *  To get started with writing your own [main] entry-point see:
 *    https://electronjs.org/docs/tutorial/first-app#electron-development-in-a-nutshell
 *
 *  To review the [UIHarness] example entry-point see:
 *    https://github.com/uiharness/uiharness/blob/master/code/libs/electron/src/main/index.ts
 *
 */
(async () => {
  const res = await uiharness.init({ config, devTools: true });
})();
