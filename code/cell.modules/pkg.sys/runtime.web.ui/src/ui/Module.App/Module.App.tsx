import React, { useState, useEffect } from 'react';

import { ModuleView } from '../Module/Module.View';
import { CssValue, DEFAULT, FC, t, ModuleUrl } from './common';

export type ModuleAppProps = {
  instance: t.ModuleInstance;
  theme?: t.ModuleTheme;
  stateful?: boolean;
  href: string;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
};

/**
 * Component
 */
const View: React.FC<ModuleAppProps> = (props) => {
  const { stateful = true } = props;

  const [clickedHref, setClickedHref] = useState('');
  const href = clickedHref && stateful ? clickedHref : props.href;

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    // Clear local state if the component's root {href} property updates.
    if (props.href !== clickedHref) setClickedHref('');
  }, [props.href]); // eslint-disable-line

  /**
   * [Handlers]
   */
  const handleExportClick = (url: string) => {
    if (!stateful) return;
    setClickedHref(url);
    pushUrlState(location.href, url);
  };

  /**
   * [Render]
   */
  return (
    <ModuleView
      instance={props.instance}
      url={href}
      theme={props.theme}
      style={props.style}
      onExportClick={(e) => {
        handleExportClick(e.url);
        props.onExportClick?.(e);
      }}
    />
  );
};

/**
 * [Helpers]
 */
function pushUrlState(locationHref: string, exportHref: string) {
  const entry = ModuleUrl.trimEntryPath(new URL(exportHref).searchParams.get('entry'));
  const next = new URL(locationHref);
  if (entry) next.searchParams.set('entry', entry);
  history.pushState({}, '', next.href);
}

/**
 * [Export]
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  Url: typeof ModuleUrl;
};
export const ModuleApp = FC.decorate<ModuleAppProps, Fields>(
  View,
  { DEFAULT, Url: ModuleUrl },
  { displayName: 'Module.App' },
);
