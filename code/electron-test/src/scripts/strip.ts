const { utils } = require('@uiharness/dev');

/**
 * Remove failing source-map refs in external modules.
 */
utils.removeSourceMapRefs('node_modules/rxjs');
