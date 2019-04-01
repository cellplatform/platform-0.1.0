import * as React from 'react';

/**
 * [react-inspector]
 */
const m = require('react-inspector');

export const ReactInspector = m.default as React.ComponentClass<any>;
export const ObjectLabel = m.ObjectLabel as React.ComponentClass<any>;
export const ObjectRootLabel = m.ObjectRootLabel as React.ComponentClass<any>;
export const ObjectName = m.ObjectName as React.ComponentClass<any>;

export const CHROME_LIGHT = require('../../../themes/chromeLight.js');
export const CHROME_DARK = require('../../../themes/chromeDark.js');

export const THEME = {
  CHROME_LIGHT: CHROME_LIGHT.default,
  CHROME_DARK: CHROME_DARK.default,
};
