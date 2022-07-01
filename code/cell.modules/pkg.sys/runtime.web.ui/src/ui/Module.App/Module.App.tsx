import React, { useState } from 'react';

import { ModuleView } from '../Module/Module.View';
import { CssValue, DEFAULT, FC, t } from './common';
import { Util } from './Util';

export type ModuleAppProps = {
  instance: t.ModuleInstance;
  theme?: t.ModuleTheme;
  href: string;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<ModuleAppProps> = (props) => {
  const [clickedHref, setClickedHref] = useState('');

  return (
    <ModuleView
      instance={props.instance}
      url={clickedHref || props.href}
      theme={props.theme}
      style={props.style}
      onExportClick={(e) => {
        // Override the {prop.href}.
        setClickedHref(e.url);

        // Update the browser URL with "entry=" query-string.
        const entry = Util.trimEntryPath(new URL(e.url).searchParams.get('entry'));
        const next = new URL(location.href);
        if (entry) next.searchParams.set('entry', entry);
        history.pushState({}, '', next.href);
      }}
    />
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  parseUrl: typeof Util.parseUrl;
};
export const ModuleApp = FC.decorate<ModuleAppProps, Fields>(
  View,
  { DEFAULT, parseUrl: Util.parseUrl },
  { displayName: 'Module.App' },
);
